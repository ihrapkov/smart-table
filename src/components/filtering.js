import { createComparison, defaultRules } from "../lib/compare.js";

// Кастомное правило для обработки диапазона суммы (totalFrom/totalTo -> total)
// Это правило должно быть ПЕРВЫМ, чтобы обработать totalFrom/totalTo до других правил
const totalRangeRule = () => (key, sourceValue, targetValue, source, target) => {
  // Это правило обрабатывает только totalFrom и totalTo
  if (key !== 'totalFrom' && key !== 'totalTo') {
    return { continue: true };
  }

  const totalFrom = target.totalFrom;
  const totalTo = target.totalTo;
  const fromEmpty = totalFrom === undefined || totalFrom === null || totalFrom === '';
  const toEmpty = totalTo === undefined || totalTo === null || totalTo === '';

  // Если оба поля пустые, пропускаем фильтрацию по сумме
  if (fromEmpty && toEmpty) {
    return { skip: true };
  }

  // Получаем значение total из источника
  const total = source.total;

  // Проверяем нижнюю границу (totalFrom ограничивает снизу)
  if (!fromEmpty) {
    const fromValue = parseFloat(totalFrom);
    if (!isNaN(fromValue) && total < fromValue) {
      return { result: false };
    }
  }

  // Проверяем верхнюю границу (totalTo ограничивает сверху)
  if (!toEmpty) {
    const toValue = parseFloat(totalTo);
    if (!isNaN(toValue) && total > toValue) {
      return { result: false };
    }
  }

  // Если прошли проверки, продолжаем с другими правилами для остальных полей
  // Но для totalFrom/totalTo мы уже дали результат
  return { result: true };
};

// @todo: #4.3 — настроить компаратор
// totalRangeRule должно быть первым, чтобы обрабатывать totalFrom/totalTo до других правил
const compare = createComparison(defaultRules, [totalRangeRule()]);

export function initFiltering(elements, indexes) {
  // @todo: #4.1 — заполнить выпадающие списки опциями
  Object.keys(indexes).forEach((elementName) => {
    const selectEl = elements[elementName];
    if (!selectEl) return;

    selectEl.append(
      ...Object.values(indexes[elementName]).map((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        return option;
      }),
    );
  });

  return (data, state, action) => {
    // @todo: #4.2 — обработать очистку поля

    Object.values(elements).forEach((el) => {
      const clearBtn = el
        .closest("form")
        ?.querySelector('button[name="clear"]');
      if (!clearBtn) return;

      clearBtn.addEventListener("click", (e) => {
        const fieldName = clearBtn.dataset.field;

        // ищем input рядом с кнопкой
        const input = clearBtn.parentElement.querySelector("input");
        if (input) input.value = "";

        // сброс значения в state
        if (elements[fieldName]) {
          elements[fieldName].value = "";
        }

        // можно вызвать onAction через e.target.form
        const form = clearBtn.closest("form");
        form?.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });

    // @todo: #4.5 — отфильтровать данные используя компаратор
    return data.filter((row) => compare(row, state));
  };
}
