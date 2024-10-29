function calculate_brf() {
    const length = parseFloat(document.getElementById('bl').value)
    const breadth = parseFloat(document.getElementById('bw').value)
    const eave = parseFloat(document.getElementById('eh').value)
    const slope = parseFloat(document.getElementById('s').value)
    const blockwall = parseFloat(document.getElementById('bwh').value)
    const seismic = parseFloat(document.getElementById('cs').value)
    const frame = parseFloat(document.getElementById('wt').value)
    const column = parseFloat(document.getElementById('ewcwt').value)
    const dead = parseFloat(document.getElementById('dl').value)
    const coll = parseFloat(document.getElementById('cl').value)
    const wind = parseFloat(document.getElementById('bsw').value)
    const brace = parseFloat(document.getElementById('bb').value)
    
    const seismic_bracing_force = (((0.01*frame) + (0.01*column) + (breadth*length*(dead+coll)) + ((eave-blockwall)*length*dead*2) + (((((eave+slope*(breadth/2))+eave)/2) - 3)*breadth*dead*2) + ((breadth*3*0.2*20*blockwall)/eave))*seismic)/(2*brace)
    
    const wind_bracing_force = ((((eave+slope*(breadth/2))+eave)/2)*breadth*wind)/(2*2*brace)

    const sbfDiv = document.getElementById('sbf');
    sbfDiv.innerText = `${sbfDiv.innerText} ${seismic_bracing_force.toFixed(2)}`;

    const wbfDiv = document.getElementById('wbf');
    wbfDiv.innerText = `${wbfDiv.innerText} ${wind_bracing_force.toFixed(2)}`;
    
    }
    