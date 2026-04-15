function addRow() {
  const container = document.getElementById('x-inputs');

  const row = document.createElement('div');
  row.className = 'x-row';

  row.innerHTML = `
    <input class="num" type="number" placeholder="x" />
    <span class="arrow">→</span>
    <input class="num result" type="number" placeholder="y" readonly />
    <button class="remove-btn" type="button" onclick="removeRow(this)" title="Remove">×</button>
  `;

  container.appendChild(row);
}

function removeRow(btn) {
  btn.closest('.x-row').remove();
}

function interpolate() {
  const x1 = parseFloat(document.getElementById('num_x1').value);
  const y1 = parseFloat(document.getElementById('num_y1').value);
  const x2 = parseFloat(document.getElementById('num_x2').value);
  const y2 = parseFloat(document.getElementById('num_y2').value);

  if ([x1, y1, x2, y2].some(isNaN)) {
    alert('Please fill in both reference points (x1, y1, x2, y2).');
    return;
  }

  if (x1 === x2) {
    alert('x1 and x2 must be different values.');
    return;
  }

  const rows = document.querySelectorAll('#x-inputs .x-row');

  rows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    const xInput = inputs[0];
    const yInput = inputs[1];

    const x = parseFloat(xInput.value);

    if (!isNaN(x)) {
      const y = y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
      yInput.value = parseFloat(y.toFixed(6));
    } else {
      yInput.value = '';
    }
  });
}
