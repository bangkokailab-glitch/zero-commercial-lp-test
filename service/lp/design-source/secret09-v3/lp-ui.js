/* In-page navigation only. This fictional sample has no form, payment or external submission. */
const sticky = document.querySelector('.sticky-cta');
const firstView = document.querySelector('.lp-fv');
const order = document.querySelector('#order');
if (sticky && firstView && order && !document.documentElement.classList.contains('export2x')) {
  let heroVisible = true;
  let orderVisible = false;
  const update = () => sticky.classList.toggle('is-visible', !heroVisible && !orderVisible);
  new IntersectionObserver(entries => {heroVisible = entries[0].isIntersecting; update();}).observe(firstView);
  new IntersectionObserver(entries => {orderVisible = entries[0].isIntersecting; update();}).observe(order);
}
