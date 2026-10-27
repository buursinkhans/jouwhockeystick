/**
 * The line under "Alle veldsticks (N)" / "Alle zaalsticks in onze catalogus"
 * on /sticks and /zaalsticks: the heading counts every stick, the list
 * starts with the hand-checked ones and the rest loads with the button
 * (decision log 2026-10-24).
 */
export function splitListNote(checked: number, imported: number): string {
  return `Hieronder staan de ${checked} sticks die we met de hand hebben gecontroleerd. De ${imported} sticks uit het aanbod van PassaHockey en Plutosport laad je met de knop onder de lijst.`;
}
