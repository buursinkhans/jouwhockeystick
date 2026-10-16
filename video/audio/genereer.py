"""Generates the background music and sound effects for the videos.

Everything is synthesised from scratch here (no samples, no AI), so
jouwhockeystick.nl owns the audio outright: no licence, no attribution and no
copyright claims on YouTube, Instagram or TikTok.

Run from the repo root:  python3 video/audio/genereer.py
Writes assets/video/muziek.mp3 and assets/video/sfx-*.mp3 (needs numpy, scipy
and ffmpeg). BEAT_FRAMES must match BEAT_FRAMES in video/src/lengte/LengteVideo.tsx.
"""

from __future__ import annotations

import subprocess
from pathlib import Path

import numpy as np
from scipy.signal import butter, sosfilt

SR = 44_100
# 14 video frames per beat at 30 fps (≈128.6 BPM, house tempo), so cuts in the
# video land exactly on the beat.
BEAT_FRAMES = 14
BEAT = BEAT_FRAMES / 30
BPM = 60 / BEAT
BARS = 34  # ≈63 s: longer than the longest video, which fades out itself
OUT = Path(__file__).resolve().parents[2] / "assets" / "video"
RNG = np.random.default_rng(7)


def t(seconds: float) -> np.ndarray:
    return np.arange(int(seconds * SR)) / SR


def lowpass(x: np.ndarray, hz: float, order: int = 2) -> np.ndarray:
    return sosfilt(butter(order, hz, "low", fs=SR, output="sos"), x)


def highpass(x: np.ndarray, hz: float, order: int = 2) -> np.ndarray:
    return sosfilt(butter(order, hz, "high", fs=SR, output="sos"), x)


def bandpass(x: np.ndarray, lo: float, hi: float) -> np.ndarray:
    return sosfilt(butter(2, [lo, hi], "band", fs=SR, output="sos"), x)


def midi(note: int) -> float:
    return 440.0 * 2 ** ((note - 69) / 12)


def saw(freq: float, seconds: float, detune: float = 0.0) -> np.ndarray:
    tt = t(seconds)
    out = np.zeros_like(tt)
    for d in (-detune, 0.0, detune):
        phase = (tt * freq * (1 + d) + RNG.random()) % 1.0
        out += 2 * phase - 1
    return out / 3


def env(seconds: float, attack: float, decay: float) -> np.ndarray:
    tt = t(seconds)
    a = np.clip(tt / max(attack, 1e-4), 0, 1)
    return a * np.exp(-np.maximum(tt - attack, 0) / decay)


def place(track: np.ndarray, sound: np.ndarray, at: float, gain: float = 1.0) -> None:
    start = int(at * SR)
    end = min(start + len(sound), len(track))
    if start < len(track):
        track[start:end] += sound[: end - start] * gain


# ---------- instruments ----------

def kick() -> np.ndarray:
    tt = t(0.35)
    freq = 45 + 95 * np.exp(-tt / 0.04)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    body = np.sin(phase) * np.exp(-tt / 0.18)
    click = highpass(RNG.standard_normal(len(tt)), 2000) * np.exp(-tt / 0.004) * 0.3
    return body + click


def clap() -> np.ndarray:
    tt = t(0.25)
    noise = bandpass(RNG.standard_normal(len(tt)), 800, 3500)
    shape = np.exp(-tt / 0.06)
    for offset in (0.0, 0.012, 0.024):  # three quick hits make a clap
        shape += np.exp(-np.maximum(tt - offset, 0) / 0.006) * (tt >= offset)
    return noise * shape * 0.35


def hat(open_: bool = False) -> np.ndarray:
    tt = t(0.2 if open_ else 0.05)
    noise = lowpass(highpass(RNG.standard_normal(len(tt)), 6000), 9000)
    return noise * np.exp(-tt / (0.05 if open_ else 0.01)) * 0.18


def pluck(note: int, seconds: float, bright: float = 2600) -> np.ndarray:
    tone = saw(midi(note), seconds, detune=0.004)
    return lowpass(tone, bright) * env(seconds, 0.003, 0.16)


def bass(note: int, seconds: float) -> np.ndarray:
    tt = t(seconds)
    tone = np.sign(np.sin(2 * np.pi * midi(note) * tt)) * 0.5 + saw(midi(note), seconds) * 0.5
    return lowpass(tone, 420) * env(seconds, 0.004, 0.22)


def pad(notes: list[int], seconds: float) -> np.ndarray:
    tone = sum(saw(midi(n), seconds, detune=0.006) for n in notes) / len(notes)
    tt = t(seconds)
    swell = np.clip(tt / 0.3, 0, 1) * np.clip((seconds - tt) / 0.3, 0, 1)
    return lowpass(tone, 1400) * swell


# vi–IV–I–V in C (Am–F–C–G), the classic driving pop/house progression.
# Full triads, no pentatonic hook.
CHORDS = [
    (45, [57, 60, 64, 69]),  # Am
    (41, [57, 60, 65, 69]),  # F
    (48, [55, 60, 64, 67]),  # C
    (43, [55, 59, 62, 67]),  # G
]
# 16th-note arpeggio over the chord tones (indexes into the chord, +12).
ARP = [0, 1, 2, 3, 2, 1, 2, 3, 0, 1, 2, 3, 3, 2, 1, 2]


def supersaw(notes: list[int], seconds: float, cutoff: float) -> np.ndarray:
    tone = sum(saw(midi(n), seconds, detune=0.012) for n in notes) / len(notes)
    return lowpass(tone, cutoff)


def riser(seconds: float) -> np.ndarray:
    tt = t(seconds)
    noise = RNG.standard_normal(len(tt))
    out = np.zeros_like(tt)
    chunk = 1024
    for i in range(0, len(tt), chunk):
        centre = 400 + 5000 * (i / len(tt)) ** 2
        seg = bandpass(noise[max(0, i - 4096) : i + chunk], centre * 0.7, min(centre * 1.4, 9000))
        out[i : i + chunk] = seg[-len(out[i : i + chunk]) :]
    return out * (tt / seconds) ** 2 * 0.5


def music() -> np.ndarray:
    length = BARS * 4 * BEAT
    n = int(length * SR) + SR
    drums = np.zeros(n)
    music_ = np.zeros(n)
    sidechain = np.ones(n)
    k, c = kick(), clap()
    duck = 1 - 0.6 * env(BEAT * 0.9, 0.002, 0.11)
    # Bar 0 is the build-up (chords + riser, no drums); the drop is at bar 1.
    place(music_, riser(4 * BEAT), 0.0, 0.8)

    for bar in range(BARS):
        start = bar * 4 * BEAT
        root, chord = CHORDS[bar % 4]
        build = bar == 0
        breakdown = bar in (16, 17)  # short breather halfway: no kick
        for beat in range(4):
            at = start + beat * BEAT
            if not build and not breakdown:
                place(drums, k, at, 0.95)
                s = int(at * SR)
                sidechain[s : s + len(duck)] = np.minimum(
                    sidechain[s : s + len(duck)], duck[: len(sidechain) - s]
                )
            if beat in (1, 3) and not build:
                place(drums, c, at, 1.1)
            # Hats only on the off-beat (no 16ths): drive without hiss.
            if not build:
                place(drums, hat(), at + BEAT / 2, 0.55)
                if beat == 3 and bar % 2 == 1:
                    place(drums, hat(open_=True), at + BEAT / 2, 0.35)
            # Off-beat supersaw stabs.
            stab = supersaw(chord, BEAT * 0.4, 3200 if not build else 1800)
            stab *= env(BEAT * 0.4, 0.004, 0.14)
            place(music_, stab, at + BEAT / 2, 0.6)
            # Classic house bass: on the off-beat, root, with a short pickup.
            if not build:
                place(music_, bass(root - 12, BEAT * 0.4), at + BEAT / 2, 0.85)
                if beat == 3:
                    place(music_, bass(root, BEAT * 0.2), at + BEAT * 0.75, 0.6)
        place(music_, pad(chord, 4 * BEAT), start, 0.16)
        # Arpeggio from bar 5 on, in blocks of 8 bars with 4 bars off.
        if bar >= 5 and (bar - 5) % 12 < 8:
            for step, idx in enumerate(ARP * 4):
                note = chord[idx] + 12
                place(music_, pluck(note, BEAT * 0.22, 2400), start + step * BEAT / 4, 0.12)
        # A riser into the bar after the breakdown.
        if bar == 17:
            place(music_, riser(4 * BEAT), start, 0.7)

    mix = drums + music_ * sidechain
    mix = mix[: int(length * SR)]
    mix = lowpass(mix, 8_500)  # warm top end
    # Slight stereo width: delay the right channel a few ms.
    right = np.concatenate([np.zeros(int(0.011 * SR)), mix])[: len(mix)]
    stereo = np.stack([mix, 0.8 * mix + 0.2 * right])
    return master(stereo, target_rms=0.17)


def master(x: np.ndarray, target_rms: float) -> np.ndarray:
    x = x / (np.sqrt(np.mean(x**2)) + 1e-9) * target_rms
    x = np.tanh(x * 1.4) / np.tanh(1.4)  # soft clip as a gentle limiter
    return x / max(1.0, np.max(np.abs(x)) / 0.95)


# ---------- sound effects ----------

def whoosh() -> np.ndarray:
    seconds = 0.45
    tt = t(seconds)
    noise = RNG.standard_normal(len(tt))
    out = np.zeros_like(tt)
    # Sweep a band upwards in short chunks.
    chunk = 512
    for i in range(0, len(tt), chunk):
        frac = i / len(tt)
        centre = 400 + 5000 * frac**1.5
        seg = bandpass(noise[max(0, i - 2048) : i + chunk], centre * 0.6, min(centre * 1.6, 18000))
        out[i : i + chunk] = seg[-len(out[i : i + chunk]) :]
    shape = np.sin(np.pi * np.clip(tt / seconds, 0, 1)) ** 2
    return out * shape * 0.6


def pop() -> np.ndarray:
    tt = t(0.18)
    freq = 520 + 700 * (1 - np.exp(-tt / 0.02))
    tone = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tt / 0.05)
    return tone * 0.7


def thud() -> np.ndarray:
    tt = t(0.3)
    freq = 70 + 120 * np.exp(-tt / 0.03)
    tone = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tt / 0.08)
    knock = bandpass(RNG.standard_normal(len(tt)), 1500, 4000) * np.exp(-tt / 0.01) * 0.25
    return tone + knock


def tick() -> np.ndarray:
    tt = t(0.03)
    return np.sin(2 * np.pi * 2400 * tt) * np.exp(-tt / 0.006) * 0.5


def ding() -> np.ndarray:
    tt = t(0.9)
    tone = sum(np.sin(2 * np.pi * midi(n) * tt) for n in (84, 88, 91)) / 3
    return tone * np.exp(-tt / 0.3) * 0.6


def nope() -> np.ndarray:
    tt = t(0.32)
    tone = np.sign(np.sin(2 * np.pi * 160 * tt)) * 0.3 + np.sin(2 * np.pi * 150 * tt) * 0.7
    shape = np.exp(-tt / 0.12) * (0.6 + 0.4 * (np.sin(2 * np.pi * 14 * tt) > 0))
    return lowpass(tone, 1200) * shape * 0.6


def write_mp3(name: str, audio: np.ndarray, bitrate: str = "160k") -> None:
    if audio.ndim == 1:
        audio = np.stack([audio, audio])
    pcm = (np.clip(audio.T, -1, 1) * 32767).astype("<i2").tobytes()
    OUT.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", str(SR), "-ac", "2",
         "-i", "-", "-codec:a", "libmp3lame", "-b:a", bitrate, str(OUT / f"{name}.mp3")],
        input=pcm, check=True,
    )


if __name__ == "__main__":
    write_mp3("muziek", music())
    for name, make in {"whoosh": whoosh, "pop": pop, "thud": thud, "tick": tick,
                       "ding": ding, "nope": nope}.items():
        write_mp3(f"sfx-{name}", master(make()[None, :].repeat(2, 0), 0.2) * 0.9, "128k")
    print("klaar:", sorted(p.name for p in OUT.glob("*.mp3")))
