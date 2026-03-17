let artifactHistory = [];

function calculateCV(critRate, critDamage) {
  return critDamage + critRate * 2;
}

function getQualityPercent(score) {
  const maxScore = 70;
  return Math.max(0, Math.min(100, (score / maxScore) * 100));
}

function saveToHistory(score, cv, rating, stats) {
  const hasAnyStats = Object.values(stats).some(value => value > 0);
  if (!hasAnyStats) return;

  const item = {
    score,
    cv,
    rating,
    stats
  };

  artifactHistory.unshift(item);
  artifactHistory = artifactHistory.slice(0, 8);
  renderHistory();
}

function renderHistory() {
  const historyList = document.getElementById("historyList");
  if (!historyList) return;

  if (artifactHistory.length === 0) {
    historyList.innerHTML = `<div class="history-empty">Пока ничего нет</div>`;
    return;
  }

  historyList.innerHTML = artifactHistory
    .map(item => {
      const statParts = [];

      if (item.stats.critRate > 0) statParts.push(`CR ${item.stats.critRate}`);
      if (item.stats.critDamage > 0) statParts.push(`CD ${item.stats.critDamage}`);
      if (item.stats.atkPercent > 0) statParts.push(`ATK% ${item.stats.atkPercent}`);
      if (item.stats.energyRecharge > 0) statParts.push(`ER ${item.stats.energyRecharge}`);
      if (item.stats.elementalMastery > 0) statParts.push(`EM ${item.stats.elementalMastery}`);

      return `
        <div class="history-item">
          <div class="history-main">
            <div class="history-score">Score: ${item.score}</div>
            <div class="history-cv">CV: ${item.cv.toFixed(1)}</div>
            <div>${item.rating}</div>
          </div>
          <div class="history-sub">${statParts.join(" • ") || "Без статов"}</div>
        </div>
      `;
    })
    .join("");
}

function clearHistory() {
  artifactHistory = [];
  renderHistory();
}



const weights = {
  critRate: 2.0,
  critDamage: 1.0,
  atkPercent: 1.0,
  atkFlat: 0.05,
  energyRecharge: 0.6,
  elementalMastery: 0.6,
  hpPercent: 0.5,
  hpFlat: 0.02,
  defPercent: 0.3,
  defFlat: 0.02
};

const maxRolls = {
  critRate: 3.9,
  critDamage: 7.8,
  atkPercent: 5.8,
  atkFlat: 19.0,
  energyRecharge: 6.5,
  elementalMastery: 23.0,
  hpPercent: 5.8,
  hpFlat: 299.0,
  defPercent: 7.3,
  defFlat: 23.0
};

function getValue(id) {
  return parseFloat(document.getElementById(id).value) || 0;
}

function calculateEffectiveRolls(stats) {
  let totalRolls = 0;

  totalRolls += (stats.critRate / maxRolls.critRate) * weights.critRate;
  totalRolls += (stats.critDamage / maxRolls.critDamage) * weights.critDamage;
  totalRolls += (stats.atkPercent / maxRolls.atkPercent) * weights.atkPercent;
  totalRolls += (stats.atkFlat / maxRolls.atkFlat) * weights.atkFlat;
  totalRolls += (stats.energyRecharge / maxRolls.energyRecharge) * weights.energyRecharge;
  totalRolls += (stats.elementalMastery / maxRolls.elementalMastery) * weights.elementalMastery;
  totalRolls += (stats.hpPercent / maxRolls.hpPercent) * weights.hpPercent;
  totalRolls += (stats.hpFlat / maxRolls.hpFlat) * weights.hpFlat;
  totalRolls += (stats.defPercent / maxRolls.defPercent) * weights.defPercent;
  totalRolls += (stats.defFlat / maxRolls.defFlat) * weights.defFlat;

  return totalRolls;
}

function getResultData(score) {
  if (score >= 60) {
    return {
      title: "Божественный артефакт",
      note: "Очень сильный артефакт. Его точно стоит оставить."
    };
  }

  if (score >= 45) {
    return {
      title: "Отличный артефакт",
      note: "Очень хороший результат. Такой артефакт уже можно спокойно использовать."
    };
  }

  if (score >= 32) {
    return {
      title: "Хороший артефакт",
      note: "Неплохой артефакт. Подойдёт для активной игры."
    };
  }

  if (score >= 20) {
    return {
      title: "Средний артефакт",
      note: "Играбельно, но потом можно будет заменить."
    };
  }

  return {
    title: "Слабый артефакт",
    note: "Скорее временный вариант. Лучше поискать что-то получше."
  };
}

function calculateScore() {
  const stats = {
    critRate: getValue("critRate"),
    critDamage: getValue("critDamage"),
    atkPercent: getValue("atkPercent"),
    atkFlat: getValue("atkFlat"),
    energyRecharge: getValue("energyRecharge"),
    elementalMastery: getValue("elementalMastery"),
    hpPercent: getValue("hpPercent"),
    hpFlat: getValue("hpFlat"),
    defPercent: getValue("defPercent"),
    defFlat: getValue("defFlat")
  };

  const score = Math.round(
    stats.critRate * weights.critRate +
    stats.critDamage * weights.critDamage +
    stats.atkPercent * weights.atkPercent +
    stats.atkFlat * weights.atkFlat +
    stats.energyRecharge * weights.energyRecharge +
    stats.elementalMastery * weights.elementalMastery +
    stats.hpPercent * weights.hpPercent +
    stats.hpFlat * weights.hpFlat +
    stats.defPercent * weights.defPercent +
    stats.defFlat * weights.defFlat
  );

  const effectiveRolls = calculateEffectiveRolls(stats);
  const cv = calculateCV(stats.critRate, stats.critDamage);
  const result = getResultData(score);
  const qualityPercent = getQualityPercent(score);

  document.getElementById("score").textContent = score;
  document.getElementById("rating").textContent = result.title;
  document.getElementById("rollInfo").textContent =
    "Эффективные роллы: " + effectiveRolls.toFixed(1);
  document.getElementById("cvInfo").textContent =
    "Crit Value: " + cv.toFixed(1);
  document.getElementById("note").textContent = result.note;

  document.getElementById("qualityLabel").textContent =
    "Качество: " + Math.round(qualityPercent) + "%";
  document.getElementById("qualityFill").style.width =
    qualityPercent + "%";

}

function resetFields() {
  const ids = [
    "critRate",
    "critDamage",
    "atkPercent",
    "atkFlat",
    "energyRecharge",
    "elementalMastery",
    "hpPercent",
    "hpFlat",
    "defPercent",
    "defFlat"
  ];

  ids.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.value = "";
    }
  });

  document.getElementById("score").textContent = "0";
  document.getElementById("rating").textContent = "Введите статы";
  document.getElementById("rollInfo").textContent = "Эффективные роллы: 0.0";
  document.getElementById("cvInfo").textContent = "Crit Value: 0.0";
  document.getElementById("qualityLabel").textContent = "Качество: 0%";
  document.getElementById("qualityFill").style.width = "0%";
  document.getElementById("note").textContent =
    "Калькулятор оценивает один артефакт по дополнительным статам.";
}

document.addEventListener("DOMContentLoaded", () => {
  const fields = document.querySelectorAll("input, select");

  fields.forEach(field => {
    field.addEventListener("input", () => {
      calculateScore();
      updateStatHighlight();
    });

    field.addEventListener("change", () => {
      calculateScore();
      updateStatHighlight();
    });
  });

  updateStatHighlight();
  renderHistory();
});

function getLevelNote(level, score) {
  if (level === 0) {
    if (score >= 20) return "Очень сильная заготовка. Стоит прокачать.";
    if (score >= 12) return "Неплохая заготовка. Можно проверить роллы.";
    return "Слабая заготовка. Прокачка рискованная.";
  }

  if (level === 4) {
    if (score >= 28) return "Хорошее начало. Можно качать дальше.";
    if (score >= 18) return "Средний старт. Зависит от следующих роллов.";
    return "Проки пока слабые.";
  }

  if (level === 8) {
    if (score >= 36) return "Уже выглядит многообещающе.";
    if (score >= 24) return "Пока средне, но ещё можно надеяться.";
    return "Скорее всего, неудачный артефакт.";
  }

  if (level === 12) {
    if (score >= 44) return "Хороший артефакт, можно продолжать.";
    if (score >= 30) return "Средний результат.";
    return "Проки слабые для этого уровня.";
  }

  if (level === 16) {
    if (score >= 52) return "Очень хороший артефакт.";
    if (score >= 38) return "Играбельно, но не топ.";
    return "Для +16 результат слабоват.";
  }

  if (level === 20) {
    if (score >= 60) return "Готовый топовый артефакт.";
    if (score >= 45) return "Сильный готовый артефакт.";
    if (score >= 32) return "Нормальный готовый артефакт.";
    return "Финальный результат слабый.";
  }

  return "Оценка обновлена.";
}

let selectedArtifactLevel = 0;

function selectLevel(level, buttonElement) {
  selectedArtifactLevel = level;

  document.querySelectorAll(".level-tab").forEach(btn => {
    btn.classList.remove("active");
  });

  buttonElement.classList.add("active");
  calculateScore();
}

function updateStatHighlight() {
  const inputs = document.querySelectorAll(".field input");

  inputs.forEach(input => {
    if (input.value && parseFloat(input.value) > 0) {
      input.classList.add("filled");
    } else {
      input.classList.remove("filled");
    }
  });
}

function saveCurrentArtifact() {
  const stats = {
    critRate: getValue("critRate"),
    critDamage: getValue("critDamage"),
    atkPercent: getValue("atkPercent"),
    atkFlat: getValue("atkFlat"),
    energyRecharge: getValue("energyRecharge"),
    elementalMastery: getValue("elementalMastery"),
    hpPercent: getValue("hpPercent"),
    hpFlat: getValue("hpFlat"),
    defPercent: getValue("defPercent"),
    defFlat: getValue("defFlat")
  };

  const score = Math.round(
    stats.critRate * weights.critRate +
    stats.critDamage * weights.critDamage +
    stats.atkPercent * weights.atkPercent +
    stats.atkFlat * weights.atkFlat +
    stats.energyRecharge * weights.energyRecharge +
    stats.elementalMastery * weights.elementalMastery +
    stats.hpPercent * weights.hpPercent +
    stats.hpFlat * weights.hpFlat +
    stats.defPercent * weights.defPercent +
    stats.defFlat * weights.defFlat
  );

  const cv = calculateCV(stats.critRate, stats.critDamage);
  const result = getResultData(score);

  saveToHistory(score, cv, result.title, stats);
}