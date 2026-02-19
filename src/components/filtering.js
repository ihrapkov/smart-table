import { createComparison, defaultRules } from "../lib/compare.js";

// @todo: #4.3 — настроить компаратор
const compare = createComparison(defaultRules);

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
