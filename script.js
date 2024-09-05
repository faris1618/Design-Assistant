function interpolate() {
const num_x1 = parseFloat(document.getElementById('num_x1').value)
const num_y1 = parseFloat(document.getElementById('num_y1').value)
const num_x2 = parseFloat(document.getElementById('num_x2').value)
const num_y2 = parseFloat(document.getElementById('num_y2').value)
const num_x = parseFloat(document.getElementById('num_x').value)

const num_y = num_y1 + ((num_x - num_x1) * (num_y2 - num_y1)) / (num_x2 - num_x1);

document.getElementById('num_y').value = num_y;

}
