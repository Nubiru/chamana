// =====================================================
// Database Integrity Tests JavaScript - Phase 3
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// =====================================================

const API_URL = 'http://localhost:3003/api';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('runTestsBtn').addEventListener('click', runTests);
  document.getElementById('refreshBtn').addEventListener('click', runTests);
});

async function runTests() {
  const loading = document.getElementById('loading');
  const results = document.getElementById('testResults');
  const summary = document.getElementById('summary');

  loading.style.display = 'block';
  results.innerHTML = '';
  summary.style.display = 'none';

  try {
    const response = await fetch(`${API_URL}/database-tests/integrity`);
    const result = await response.json();

    if (result.success) {
      displayResults(result.data);
    } else {
      showError(result.error);
    }
  } catch (error) {
    showError(error.message);
  } finally {
    loading.style.display = 'none';
  }
}

function displayResults(data) {
  const results = document.getElementById('testResults');
  const summary = document.getElementById('summary');

  // Update summary
  document.getElementById('passedCount').textContent = data.summary.passed;
  document.getElementById('failedCount').textContent = data.summary.failed;
  document.getElementById('totalCount').textContent = data.summary.total;
  summary.style.display = 'block';

  // Display each test
  Object.entries(data.tests).forEach(([key, test]) => {
    const card = createTestCard(test);
    results.appendChild(card);
  });
}

function createTestCard(test) {
  const col = document.createElement('div');
  col.className = 'col-md-6 mb-3';

  const card = document.createElement('div');
  card.className = `card ${test.passed ? 'border-success' : 'border-danger'}`;

  const cardHeader = document.createElement('div');
  cardHeader.className = `card-header ${
    test.passed ? 'bg-success text-white' : 'bg-danger text-white'
  }`;
  cardHeader.innerHTML = `
    <h5 class="mb-0">
      ${
        test.passed
          ? '<i class="bi bi-check-circle"></i>'
          : '<i class="bi bi-x-circle"></i>'
      }
      ${test.name}
    </h5>
  `;

  const cardBody = document.createElement('div');
  cardBody.className = 'card-body';

  let detailsHtml = '<ul class="list-unstyled mb-0">';
  Object.entries(test.details).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      detailsHtml += `<li><strong>${key}:</strong> ${JSON.stringify(
        value,
        null,
        2
      )}</li>`;
    } else {
      detailsHtml += `<li><strong>${key}:</strong> ${value}</li>`;
    }
  });
  detailsHtml += '</ul>';

  cardBody.innerHTML = detailsHtml;

  card.appendChild(cardHeader);
  card.appendChild(cardBody);
  col.appendChild(card);

  return col;
}

function showError(message) {
  const results = document.getElementById('testResults');
  results.innerHTML = `
    <div class="col-md-12">
      <div class="alert alert-danger">
        <h4><i class="bi bi-exclamation-triangle"></i> Error</h4>
        <p>${message}</p>
      </div>
    </div>
  `;
}
