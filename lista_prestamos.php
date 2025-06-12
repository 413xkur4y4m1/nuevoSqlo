<?php
include 'db.php';
$stmt = $pdo->query("SELECT p.*, m.nombre as material FROM prestamos p JOIN materiales m ON p.material_id = m.id ORDER BY p.fecha_prestamo DESC");
$prestamos = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Lista de Préstamos</title></head>
<body>
  <h1>Lista de Préstamos</h1>
  <table border="1" cellpadding="8">
    <tr>
      <th>Alumno</th><th>Matrícula</th><th>Email</th>
      <th>Material</th><th>Cantidad</th>
      <th>Fecha préstamo</th>
      <th>Materia</th>
    </tr>
    <?php foreach($prestamos as $row): ?>
      <tr>
        <td><?= htmlspecialchars($row['nombre']) ?></td>
        <td><?= htmlspecialchars($row['matricula']) ?></td>
        <td><?= htmlspecialchars($row['email']) ?></td>
        <td><?= htmlspecialchars($row['material']) ?></td>
        <td><?= $row['cantidad'] ?></td>
        <td><?= $row['fecha_prestamo'] ?></td>
        <td><?= htmlspecialchars($row['materia']) ?></td>
      </tr>
    <?php endforeach; ?>
  </table>
  <a href="index.html">Volver al inicio</a>
</body>
</html>
