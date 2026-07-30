// Category filter for the grouped portfolio sections.
const sectionBlocks = Array.from(document.querySelectorAll('[data-category-group]'));
const pills = Array.from(document.querySelectorAll('.filter-pill'));

if (pills.length) {
  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      if (pill.classList.contains('active')) return;
      pills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.dataset.filter || 'all';

      if (sectionBlocks.length) {
        sectionBlocks.forEach((block) => {
          const groupName = block.dataset.categoryGroup;
          if (filter === 'all' || groupName === filter) {
            block.style.display = 'block';
          } else {
            block.style.display = 'none';
          }
        });
      }
    });
  });
}

// 2-Row Paginated Category Slider Navigation
const categoryBlocks = document.querySelectorAll('.category-group-block');
categoryBlocks.forEach((block) => {
  const track = block.querySelector('[data-category-track]');
  const prevBtn = block.querySelector('.category-prev');
  const nextBtn = block.querySelector('.category-next');
  if (!track) return;

  const pages = Array.from(track.querySelectorAll('.category-grid-page'));
  if (pages.length <= 1) return;

  let currentPage = 0;
  const maxPage = pages.length - 1;

  const updateSliderState = () => {
    track.style.transform = `translateX(-${currentPage * 100}%)`;
    if (prevBtn) prevBtn.disabled = currentPage === 0;
    if (nextBtn) nextBtn.disabled = currentPage === maxPage;
  };

  updateSliderState();

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 0) {
        currentPage--;
        updateSliderState();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentPage < maxPage) {
        currentPage++;
        updateSliderState();
      }
    });
  }
});
