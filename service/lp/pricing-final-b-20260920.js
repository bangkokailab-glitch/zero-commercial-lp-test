(function () {
  var root = document.getElementById('pricing-final-b');
  if (!root) return;

  // Pricing copy is authored in index.html; JavaScript only enhances mobile tables.

  function buildTransposedTable(sourceSelector, targetSelector, tableClass, firstHeading) {
    var source = root.querySelector(sourceSelector);
    var target = root.querySelector(targetSelector);
    if (!source || !target || target.querySelector('table')) return;

    var planHeaders = Array.prototype.slice.call(source.querySelectorAll('thead th'), 1);
    var itemRows = Array.prototype.slice.call(source.querySelectorAll('tbody tr'));
    var table = document.createElement('table');
    table.className = 'pfb-table ' + tableClass;

    var thead = document.createElement('thead');
    var headRow = document.createElement('tr');
    var corner = document.createElement('th');
    corner.scope = 'col';
    corner.textContent = firstHeading;
    headRow.appendChild(corner);
    itemRows.forEach(function (row) {
      var th = document.createElement('th');
      th.scope = 'col';
      th.innerHTML = row.children[0].innerHTML;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    planHeaders.forEach(function (planHeader, planIndex) {
      var row = document.createElement('tr');
      if (planIndex === 1 && source.matches('.pfb-comparison-table')) {
        row.className = 'pfb-mobile-recommended';
      }
      var plan = document.createElement('th');
      plan.scope = 'row';
      plan.className = planHeader.className;
      plan.innerHTML = planHeader.innerHTML;
      row.appendChild(plan);

      itemRows.forEach(function (itemRow) {
        var td = document.createElement('td');
        if (itemRow.classList.contains('pfb-price')) td.classList.add('pfb-transposed-price');
        if (itemRow.classList.contains('pfb-audience')) td.classList.add('pfb-transposed-audience');
        td.innerHTML = itemRow.children[planIndex + 1].innerHTML;
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    target.appendChild(table);
  }

  buildTransposedTable('.pfb-comparison-table', '.pfb-comparison-mobile-wrap', 'pfb-comparison-table-mobile', 'プラン');
  buildTransposedTable('.pfb-operation-table', '.pfb-operation-mobile-wrap', 'pfb-operation-table-mobile', 'プラン');
  root.classList.add('pfb-enhanced');
})();
