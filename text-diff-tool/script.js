const file1Input = document.getElementById('file1');
const file2Input = document.getElementById('file2');
const text1 = document.getElementById('text1');
const text2 = document.getElementById('text2');
const compareBtn = document.getElementById('compareBtn');
const clearBtn = document.getElementById('clearBtn');
const leftDiff = document.getElementById('leftDiff');
const rightDiff = document.getElementById('rightDiff');
const addedCount = document.getElementById('addedCount');
const removedCount = document.getElementById('removedCount');
const changedCount = document.getElementById('changedCount');
const statusText = document.getElementById('statusText');

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function readFileIntoTextarea(fileInput, target) {
  const file = fileInput.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    target.value = String(reader.result ?? '');
  };
  reader.readAsText(file);
}

file1Input.addEventListener('change', () => readFileIntoTextarea(file1Input, text1));
file2Input.addEventListener('change', () => readFileIntoTextarea(file2Input, text2));

function splitLines(text) {
  return text.replace(/\r\n/g, '\n').split('\n');
}

function tokenize(text) {
  if (!text) return [];
  return text.match(/\s+|\w+|[^\w\s]/g) || [];
}

function lcsMatrix(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1] + 1;
      } else {
        matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
      }
    }
  }

  return matrix;
}

function backtrackDiff(a, b, matrix) {
  const ops = [];
  let i = a.length;
  let j = b.length;

  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      ops.push({ type: 'equal', left: a[i - 1], right: b[j - 1] });
      i -= 1;
      j -= 1;
    } else if (matrix[i - 1][j] >= matrix[i][j - 1]) {
      ops.push({ type: 'remove', left: a[i - 1], right: '' });
      i -= 1;
    } else {
      ops.push({ type: 'add', left: '', right: b[j - 1] });
      j -= 1;
    }
  }

  while (i > 0) {
    ops.push({ type: 'remove', left: a[i - 1], right: '' });
    i -= 1;
  }

  while (j > 0) {
    ops.push({ type: 'add', left: '', right: b[j - 1] });
    j -= 1;
  }

  return ops.reverse();
}

function diffTokens(left, right) {
  const leftTokens = tokenize(left);
  const rightTokens = tokenize(right);
  const matrix = lcsMatrix(leftTokens, rightTokens);
  const ops = backtrackDiff(leftTokens, rightTokens, matrix);

  let leftHtml = '';
  let rightHtml = '';

  for (const op of ops) {
    if (op.type === 'equal') {
      const token = escapeHtml(op.left);
      leftHtml += token;
      rightHtml += token;
    } else if (op.type === 'remove') {
      leftHtml += `<span class="inline-removed">${escapeHtml(op.left)}</span>`;
    } else if (op.type === 'add') {
      rightHtml += `<span class="inline-added">${escapeHtml(op.right)}</span>`;
    }
  }

  return { leftHtml, rightHtml };
}

function buildLineDiff(leftText, rightText) {
  const leftLines = splitLines(leftText);
  const rightLines = splitLines(rightText);
  const matrix = lcsMatrix(leftLines, rightLines);
  const ops = backtrackDiff(leftLines, rightLines, matrix);

  const combined = [];

  for (let i = 0; i < ops.length; i += 1) {
    const current = ops[i];
    const next = ops[i + 1];

    if (current?.type === 'remove' && next?.type === 'add') {
      const tokenDiff = diffTokens(current.left, next.right);
      combined.push({
        type: 'changed',
        left: current.left,
        right: next.right,
        leftHtml: tokenDiff.leftHtml,
        rightHtml: tokenDiff.rightHtml
      });
      i += 1;
      continue;
    }

    if (current?.type === 'add' && next?.type === 'remove') {
      const tokenDiff = diffTokens(next.left, current.right);
      combined.push({
        type: 'changed',
        left: next.left,
        right: current.right,
        leftHtml: tokenDiff.leftHtml,
        rightHtml: tokenDiff.rightHtml
      });
      i += 1;
      continue;
    }

    if (current.type === 'equal') {
      combined.push({
        type: 'equal',
        left: current.left,
        right: current.right,
        leftHtml: escapeHtml(current.left),
        rightHtml: escapeHtml(current.right)
      });
    } else if (current.type === 'remove') {
      combined.push({
        type: 'removed',
        left: current.left,
        right: '',
        leftHtml: escapeHtml(current.left),
        rightHtml: ''
      });
    } else if (current.type === 'add') {
      combined.push({
        type: 'added',
        left: '',
        right: current.right,
        leftHtml: '',
        rightHtml: escapeHtml(current.right)
      });
    }
  }

  return combined;
}

function renderDiffLine(lineNumber, contentHtml, type) {
  const lineClass = type ? `diff-line ${type}` : 'diff-line';
  const shownContent = contentHtml === '' ? '&nbsp;' : contentHtml;
  const lineNo = Number.isFinite(lineNumber) ? lineNumber : '';
  return `
    <div class="${lineClass}">
      <div class="line-number">${lineNo}</div>
      <div class="line-content">${shownContent}</div>
    </div>
  `;
}

function renderDiff(diffRows) {
  if (!diffRows.length) {
    leftDiff.innerHTML = '<div class="empty-state">Nothing to show yet.</div>';
    rightDiff.innerHTML = '<div class="empty-state">Nothing to show yet.</div>';
    return;
  }

  let leftHtml = '';
  let rightHtml = '';
  let leftLineNo = 1;
  let rightLineNo = 1;
  let add = 0;
  let remove = 0;
  let change = 0;

  for (const row of diffRows) {
    if (row.type === 'equal') {
      leftHtml += renderDiffLine(leftLineNo, row.leftHtml, '');
      rightHtml += renderDiffLine(rightLineNo, row.rightHtml, '');
      leftLineNo += 1;
      rightLineNo += 1;
    } else if (row.type === 'removed') {
      leftHtml += renderDiffLine(leftLineNo, row.leftHtml, 'removed');
      rightHtml += renderDiffLine('', '', 'empty');
      leftLineNo += 1;
      remove += 1;
    } else if (row.type === 'added') {
      leftHtml += renderDiffLine('', '', 'empty');
      rightHtml += renderDiffLine(rightLineNo, row.rightHtml, 'added');
      rightLineNo += 1;
      add += 1;
    } else if (row.type === 'changed') {
      leftHtml += renderDiffLine(leftLineNo, row.leftHtml, 'changed');
      rightHtml += renderDiffLine(rightLineNo, row.rightHtml, 'changed');
      leftLineNo += 1;
      rightLineNo += 1;
      change += 1;
    }
  }

  leftDiff.innerHTML = leftHtml;
  rightDiff.innerHTML = rightHtml;
  addedCount.textContent = String(add);
  removedCount.textContent = String(remove);
  changedCount.textContent = String(change);

  const hasDiff = add > 0 || remove > 0 || change > 0;
  statusText.textContent = hasDiff ? 'Differences found' : 'Files are identical';
}

function compareTexts() {
  const left = text1.value;
  const right = text2.value;
  const diffRows = buildLineDiff(left, right);
  renderDiff(diffRows);
}

function clearAll() {
  text1.value = '';
  text2.value = '';
  file1Input.value = '';
  file2Input.value = '';
  addedCount.textContent = '0';
  removedCount.textContent = '0';
  changedCount.textContent = '0';
  statusText.textContent = 'Waiting';
  leftDiff.innerHTML = '<div class="empty-state">Upload or paste the original text.</div>';
  rightDiff.innerHTML = '<div class="empty-state">Upload or paste the modified text.</div>';
}

compareBtn.addEventListener('click', compareTexts);
clearBtn.addEventListener('click', clearAll);

[text1, text2].forEach((field) => {
  field.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      compareTexts();
    }
  });
});

function syncScroll(source, target) {
  let isSyncing = false;
  source.addEventListener('scroll', () => {
    if (isSyncing) return;
    isSyncing = true;
    target.scrollTop = source.scrollTop;
    target.scrollLeft = source.scrollLeft;
    requestAnimationFrame(() => {
      isSyncing = false;
    });
  });
}

syncScroll(leftDiff, rightDiff);
syncScroll(rightDiff, leftDiff);
clearAll();
