document.addEventListener("DOMContentLoaded", () => {
  const categorySelect = document.getElementById("category");
  const inputValue = document.getElementById("input-value");
  const outputValue = document.getElementById("output-value");
  const fromUnit = document.getElementById("from-unit");
  const toUnit = document.getElementById("to-unit");
  const swapBtn = document.getElementById("swap-btn");
  const converterForm = document.getElementById("converter-form");
  const historyList = document.getElementById("history-list");
  const selectedCategoryLabel = document.getElementById("selected-category-label");
  const categoryCards = document.querySelectorAll(".category-card");
  const quickChips = document.querySelectorAll(".chip");

  const unitData = {
    length: {
      label: "Length",
      units: {
        millimeter: { name: "Millimeter", symbol: "mm", factor: 0.001 },
        centimeter: { name: "Centimeter", symbol: "cm", factor: 0.01 },
        meter: { name: "Meter", symbol: "m", factor: 1 },
        kilometer: { name: "Kilometer", symbol: "km", factor: 1000 },
        inch: { name: "Inch", symbol: "in", factor: 0.0254 },
        foot: { name: "Foot", symbol: "ft", factor: 0.3048 },
        yard: { name: "Yard", symbol: "yd", factor: 0.9144 },
        mile: { name: "Mile", symbol: "mi", factor: 1609.344 }
      }
    },

    area: {
      label: "Area",
      units: {
        square_millimeter: { name: "Square Millimeter", symbol: "mm²", factor: 0.000001 },
        square_centimeter: { name: "Square Centimeter", symbol: "cm²", factor: 0.0001 },
        square_meter: { name: "Square Meter", symbol: "m²", factor: 1 },
        square_kilometer: { name: "Square Kilometer", symbol: "km²", factor: 1000000 },
        square_inch: { name: "Square Inch", symbol: "in²", factor: 0.00064516 },
        square_foot: { name: "Square Foot", symbol: "ft²", factor: 0.09290304 },
        square_yard: { name: "Square Yard", symbol: "yd²", factor: 0.83612736 },
        acre: { name: "Acre", symbol: "ac", factor: 4046.8564224 },
        hectare: { name: "Hectare", symbol: "ha", factor: 10000 }
      }
    },

    volume: {
      label: "Volume",
      units: {
        milliliter: { name: "Milliliter", symbol: "mL", factor: 0.000001 },
        liter: { name: "Liter", symbol: "L", factor: 0.001 },
        cubic_meter: { name: "Cubic Meter", symbol: "m³", factor: 1 },
        cubic_centimeter: { name: "Cubic Centimeter", symbol: "cm³", factor: 0.000001 },
        cubic_inch: { name: "Cubic Inch", symbol: "in³", factor: 0.000016387064 },
        cubic_foot: { name: "Cubic Foot", symbol: "ft³", factor: 0.028316846592 },
        gallon_us: { name: "US Gallon", symbol: "gal", factor: 0.003785411784 }
      }
    },

    mass: {
      label: "Mass",
      units: {
        milligram: { name: "Milligram", symbol: "mg", factor: 0.000001 },
        gram: { name: "Gram", symbol: "g", factor: 0.001 },
        kilogram: { name: "Kilogram", symbol: "kg", factor: 1 },
        tonne: { name: "Tonne", symbol: "t", factor: 1000 },
        ounce: { name: "Ounce", symbol: "oz", factor: 0.028349523125 },
        pound: { name: "Pound", symbol: "lb", factor: 0.45359237 }
      }
    },

    temperature: {
      label: "Temperature",
      units: {
        celsius: { name: "Celsius", symbol: "°C" },
        fahrenheit: { name: "Fahrenheit", symbol: "°F" },
        kelvin: { name: "Kelvin", symbol: "K" }
      }
    },

    pressure: {
      label: "Pressure",
      units: {
        pascal: { name: "Pascal", symbol: "Pa", factor: 1 },
        kilopascal: { name: "Kilopascal", symbol: "kPa", factor: 1000 },
        megapascal: { name: "Megapascal", symbol: "MPa", factor: 1000000 },
        bar: { name: "Bar", symbol: "bar", factor: 100000 },
        psi: { name: "PSI", symbol: "psi", factor: 6894.757293168 },
        ksi: { name: "KSI", symbol: "ksi", factor: 6894757.293168 }
      }
    },

    speed: {
      label: "Speed",
      units: {
        meter_per_second: { name: "Meter/Second", symbol: "m/s", factor: 1 },
        kilometer_per_hour: { name: "Kilometer/Hour", symbol: "km/h", factor: 0.2777777778 },
        mile_per_hour: { name: "Mile/Hour", symbol: "mph", factor: 0.44704 },
        foot_per_second: { name: "Foot/Second", symbol: "ft/s", factor: 0.3048 },
        knot: { name: "Knot", symbol: "kn", factor: 0.5144444444 }
      }
    },

    force: {
      label: "Force",
      units: {
        newton: { name: "Newton", symbol: "N", factor: 1 },
        kilonewton: { name: "Kilonewton", symbol: "kN", factor: 1000 },
        pound_force: { name: "Pound-force", symbol: "lbf", factor: 4.4482216152605 },
        kip: { name: "Kip", symbol: "kip", factor: 4448.2216152605 }
      }
    }
  };

  const quickPickMap = {
    "mm → m": { category: "length", from: "millimeter", to: "meter" },
    "m → ft": { category: "length", from: "meter", to: "foot" },
    "kg → lb": { category: "mass", from: "kilogram", to: "pound" },
    "°C → °F": { category: "temperature", from: "celsius", to: "fahrenheit" },
    "kPa → psi": { category: "pressure", from: "kilopascal", to: "psi" },
    "km/h → m/s": { category: "speed", from: "kilometer_per_hour", to: "meter_per_second" }
  };

  const history = [];

  function formatNumber(value) {
    if (!Number.isFinite(value)) return "";
    return Number(value)
      .toLocaleString(undefined, {
        maximumFractionDigits: 10
      })
      .replace(/(\.\d*?[1-9])0+$/g, "$1")
      .replace(/\.0+$/, "");
  }

  function clearOutput() {
    outputValue.value = "";
  }

  function updateCategoryCards(activeCategory) {
    categoryCards.forEach((card) => {
      card.classList.toggle("active", card.dataset.category === activeCategory);
    });
  }

  function updateSelectedCategoryLabel(category) {
    selectedCategoryLabel.textContent = `Currently selected: ${unitData[category].label}`;
  }

  function populateUnits(category, preferredFrom = null, preferredTo = null) {
    const units = unitData[category].units;
    const keys = Object.keys(units);

    fromUnit.innerHTML = "";
    toUnit.innerHTML = "";

    keys.forEach((key) => {
      const fromOption = document.createElement("option");
      fromOption.value = key;
      fromOption.textContent = `${units[key].name} (${units[key].symbol})`;
      fromUnit.appendChild(fromOption);

      const toOption = document.createElement("option");
      toOption.value = key;
      toOption.textContent = `${units[key].name} (${units[key].symbol})`;
      toUnit.appendChild(toOption);
    });

    if (preferredFrom && units[preferredFrom]) {
      fromUnit.value = preferredFrom;
    } else {
      fromUnit.value = keys[0];
    }

    if (preferredTo && units[preferredTo]) {
      toUnit.value = preferredTo;
    } else {
      toUnit.value = keys.length > 1 ? keys[1] : keys[0];
    }

    if (fromUnit.value === toUnit.value && keys.length > 1) {
      toUnit.value = keys[1];
    }
  }

  function setCategory(category, preferredFrom = null, preferredTo = null) {
    categorySelect.value = category;
    populateUnits(category, preferredFrom, preferredTo);
    updateSelectedCategoryLabel(category);
    updateCategoryCards(category);
    clearOutput();
  }

  function toBaseUnit(category, value, unitKey) {
    return value * unitData[category].units[unitKey].factor;
  }

  function fromBaseUnit(category, value, unitKey) {
    return value / unitData[category].units[unitKey].factor;
  }

  function convertTemperature(value, from, to) {
    if (from === to) return value;

    let celsiusValue;

    switch (from) {
      case "celsius":
        celsiusValue = value;
        break;
      case "fahrenheit":
        celsiusValue = (value - 32) * (5 / 9);
        break;
      case "kelvin":
        celsiusValue = value - 273.15;
        break;
      default:
        return NaN;
    }

    switch (to) {
      case "celsius":
        return celsiusValue;
      case "fahrenheit":
        return (celsiusValue * 9) / 5 + 32;
      case "kelvin":
        return celsiusValue + 273.15;
      default:
        return NaN;
    }
  }

  function convertValue(category, value, from, to) {
    if (!unitData[category]) return NaN;
    if (!unitData[category].units[from] || !unitData[category].units[to]) return NaN;

    if (from === to) return value;

    if (category === "temperature") {
      return convertTemperature(value, from, to);
    }

    const baseValue = toBaseUnit(category, value, from);
    return fromBaseUnit(category, baseValue, to);
  }

  function renderHistory() {
    historyList.innerHTML = "";

    if (history.length === 0) {
      const li = document.createElement("li");
      li.className = "history-item";
      li.textContent = "No conversions yet.";
      historyList.appendChild(li);
      return;
    }

    history.forEach((entry) => {
      const li = document.createElement("li");
      li.className = "history-item";
      li.textContent = entry;
      historyList.appendChild(li);
    });
  }

  function addToHistory(text) {
    history.unshift(text);
    if (history.length > 8) {
      history.pop();
    }
    renderHistory();
  }

  function getUnitSymbol(category, unitKey) {
    return unitData[category].units[unitKey].symbol;
  }

  function performConversion(saveToHistory = true) {
    const category = categorySelect.value;
    const rawValue = inputValue.value.trim();
    const from = fromUnit.value;
    const to = toUnit.value;

    if (rawValue === "") {
      clearOutput();
      return;
    }

    const numericValue = Number(rawValue);

    if (!Number.isFinite(numericValue)) {
      outputValue.value = "Invalid input";
      return;
    }

    const result = convertValue(category, numericValue, from, to);

    if (!Number.isFinite(result)) {
      outputValue.value = "Conversion error";
      return;
    }

    const formattedInput = formatNumber(numericValue);
    const formattedResult = formatNumber(result);
    const fromSymbol = getUnitSymbol(category, from);
    const toSymbol = getUnitSymbol(category, to);

    outputValue.value = formattedResult;

    if (saveToHistory) {
      addToHistory(`${formattedInput} ${fromSymbol} → ${formattedResult} ${toSymbol}`);
    }
  }

  categoryCards.forEach((card) => {
    card.addEventListener("click", () => {
      const category = card.dataset.category;
      setCategory(category);
    });
  });

  categorySelect.addEventListener("change", (e) => {
    setCategory(e.target.value);
  });

  swapBtn.addEventListener("click", () => {
    const currentFrom = fromUnit.value;
    const currentTo = toUnit.value;

    fromUnit.value = currentTo;
    toUnit.value = currentFrom;

    if (inputValue.value.trim() !== "") {
      performConversion(false);
    } else {
      clearOutput();
    }
  });

  converterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    performConversion(true);
  });

  converterForm.addEventListener("reset", () => {
    setTimeout(() => {
      inputValue.value = "";
      outputValue.value = "";
      setCategory("length", "meter", "foot");
    }, 0);
  });

  inputValue.addEventListener("input", () => {
    if (inputValue.value.trim() === "") {
      clearOutput();
      return;
    }
    performConversion(false);
  });

  fromUnit.addEventListener("change", () => {
    if (inputValue.value.trim() !== "") {
      performConversion(false);
    } else {
      clearOutput();
    }
  });

  toUnit.addEventListener("change", () => {
    if (inputValue.value.trim() !== "") {
      performConversion(false);
    } else {
      clearOutput();
    }
  });

  quickChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const config = quickPickMap[chip.textContent.trim()];
      if (!config) return;

      setCategory(config.category, config.from, config.to);

      if (inputValue.value.trim() !== "") {
        performConversion(false);
      }
    });
  });

  setCategory("length", "meter", "foot");
  renderHistory();
});