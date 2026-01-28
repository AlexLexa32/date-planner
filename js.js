const API_URL = "http://localhost:3000/api/ideas";

const form = document.getElementById("cardForm");
const titleInput = document.getElementById("title");
const durationInput = document.getElementById("duration");
const categorySelect = document.getElementById("category");
const cardsContainer = document.getElementById("cardsContainer");

// Загрузка идей с сервера
async function loadIdeas() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Ошибка загрузки идей");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Отрисовка всех карточек
async function renderCards() {
  const ideas = await loadIdeas();
  cardsContainer.innerHTML = "";

  if (ideas.length === 0) {
    cardsContainer.innerHTML = '<div class="empty">Пока нет идей. Создайте первую!</div>';
    return;
  }

  ideas.forEach(idea => {
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    cardEl.draggable = true;
    cardEl.dataset.id = idea.id;

    cardEl.innerHTML = `
      <button class="card-remove" title="Удалить">&times;</button>
      <div class="card-title">${idea.title}</div>
      <div class="card-duration">${idea.duration} мин</div>
      <div class="card-category">${getCategoryLabel(idea.category)}</div>
    `;

    // Удаление карточки (через сервер)
    cardEl.querySelector(".card-remove").addEventListener("click", async () => {
      const id = idea.id;
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        renderCards();
      } else {
        alert("Не удалось удалить идею");
      }
    });

    cardsContainer.appendChild(cardEl);
  });
}

function getCategoryLabel(value) {
  const map = {
    relax: "Отдых / прогулка",
    date: "Классическое свидание",
    activity: "Активность",
    culture: "Культура",
    home: "Дома / уют",
  };
  return map[value] || value;
}

// Обработчик формы
form.addEventListener("submit", async e => {
  e.preventDefault();

  const newIdea = {
    title: titleInput.value.trim(),
    duration: parseInt(durationInput.value, 10),
    category: categorySelect.value,
  };

  if (!newIdea.title || !newIdea.duration || !newIdea.category) {
    alert("Заполните все поля");
    return;
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newIdea),
  });

  if (res.ok) {
    const saved = await res.json();
    console.log("Идея сохранена в БД:", saved);
    renderCards();
    // очистка формы
    titleInput.value = "";
    durationInput.value = 90;
    categorySelect.value = "relax";
  } else {
    alert("Ошибка сохранения идеи");
  }
});

// Первоначальная отрисовка
renderCards();
