// Filter chips: show/hide cards by data-tracks. Works without layout shift on load
// (all cards visible by default); chips are buttons with aria-pressed.
export function initFilters() {
  const chips = document.querySelectorAll<HTMLButtonElement>('[data-filter]');
  const cards = document.querySelectorAll<HTMLElement>('[data-tracks]');
  const status = document.getElementById('filter-status');

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const id = chip.dataset.filter!;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      let shown = 0;
      cards.forEach((card) => {
        const match = id === 'all' || (card.dataset.tracks ?? '').split(' ').includes(id);
        card.hidden = !match;
        if (match && card.tagName === 'LI') shown++; // constellation dots share data-tracks but aren't counted
      });
      document.dispatchEvent(new Event('filtered'));
      if (status) status.textContent = `Showing ${shown} case ${shown === 1 ? 'study' : 'studies'}`;
    });
  });
}
