function calculateBeam() {
  const L = parseFloat(document.getElementById("length").value);
  const P = parseFloat(document.getElementById("load").value);
  const type = document.getElementById("loadType").value;
  const a = parseFloat(document.getElementById("position").value);

  let RA, RB, Mmax, Vmax;

  if (type === "point") {
    // Point Load
    RB = (P * a) / L;
    RA = P - RB;

    Vmax = Math.max(RA, RB);
    Mmax = RA * a;
  } else {
    // UDL
    RA = RB = (P * L) / 2;

    Vmax = RA;
    Mmax = (P * L * L) / 8;
  }

  document.getElementById("ra").innerText = RA.toFixed(2) + " kN";
  document.getElementById("rb").innerText = RB.toFixed(2) + " kN";
  document.getElementById("shear").innerText = Vmax.toFixed(2) + " kN";
  document.getElementById("moment").innerText = Mmax.toFixed(2) + " kN·m";
}