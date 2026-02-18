if (window.jQuery && typeof jQuery.isNumeric !== 'function') {
  jQuery.isNumeric = function (value) {
    return !isNaN(parseFloat(value)) && isFinite(value)
  }
}
