fetch('/api/lista-prestamos')
.then(r=>r.json()).then(lista=>{
  const tbody = document.querySelector('#prestamos tbody');
  lista.forEach(row=>{
    let tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.matricula}</td><td>${row.nombre}</td><td>${row.material}</td><td>${row.fecha_limite}</td><td>${row.estado}</td>`;
    tbody.appendChild(tr);
  });
});
fetch('/api/lista-adeudos')
.then(r=>r.json()).then(lista=>{
  const tbody = document.querySelector('#adeudos tbody');
  lista.forEach(row=>{
    let tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.matricula}</td><td>${row.nombre}</td><td>${row.material}</td><td>${row.fecha_limite}</td><td>${row.descripcion}</td><td>${row.monto}</td>`;
    tbody.appendChild(tr);
  });
});
