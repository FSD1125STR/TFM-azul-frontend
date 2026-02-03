# 🧑‍💻 Flujo de trabajo en GitHub

Este proyecto utiliza un flujo de trabajo basado en **ramas** para garantizar un desarrollo ordenado, colaborativo y con control de cambios.  
El objetivo es mantener la rama principal siempre estable y facilitar la revisión del código.

---

## 🌿 Rama principal (`main`)

- La rama `main` contiene **la versión estable del proyecto**.
- Todo el desarrollo se realiza **fuera de `main`**.
- Solo se fusiona código en `main` mediante **Pull Requests**.

---

## 🔄 1. Actualizar la rama principal

Antes de comenzar cualquier desarrollo, es obligatorio asegurarse de tener la versión más actualizada del proyecto.

```bash
git checkout main
git pull origin main
```

Esto evita conflictos y asegura que se trabaja sobre la última versión del código.

---

## 🌱 2. Crear una rama para cada desarrollo

Para cada funcionalidad, historia de usuario o tarea relevante, se debe crear una **rama específica** a partir de `main`.

```bash
git checkout -b feature/nombre-descriptiv
```

Ejemplos de nombres de rama:
- `feature/registro-usuario`
- `feature/crear-crew`
- `feature/eventos`
- `fix/bug-login`

---

## 📝 3. Realizar commits pequeños y frecuentes

Durante el desarrollo:
- Se deben realizar **commits pequeños y frecuentes**.
- Cada commit debe representar un avance concreto (una tarea, ajuste o mejora).

Buenas prácticas:
- ❌ No hacer un único commit al final del desarrollo.
- ✅ Hacer commits al completar partes funcionales.

```bash
git add .
git commit -m "mensaje descriptivo del cambio"
```

Esto facilita la revisión del código y el seguimiento del progreso.

---

## 🔁 4. Mantener la rama de desarrollo actualizada

Si el desarrollo se prolonga en el tiempo, es recomendable traer periódicamente los cambios de `main` para evitar conflictos grandes.

```bash
git pull origin main
git checkout feature/nombre-descriptivo
git merge main
```
---

## 🔀 5. Crear Pull Request

Cuando la tarea o funcionalidad esté **completamente finalizada y probada**:

1. Subir la rama al repositorio remoto.
2. Crear un **Pull Request** desde GitHub:
   - Origen: rama de desarrollo
   - Destino: `main`
   - Añadir una descripción clara de los cambios realizados.
     
```bash
git push origin feature/nombre-descriptivo
```

---

## ✅ 6. Revisión y merge

- El Pull Request debe revisarse antes de fusionarse.
- Si todo es correcto:
  - Se realiza el **merge en `main`**.
  - La rama de desarrollo puede eliminarse.

La rama `main` debe quedar siempre en un estado estable y funcional.

---

## 📌 Resumen del flujo de trabajo

1. Actualizar la rama `main`
2. Crear una rama para el desarrollo
3. Realizar commits pequeños y frecuentes
4. Mantener la rama actualizada con `main` si es necesario
5. Crear un Pull Request al finalizar
6. Revisar y fusionar en `main`

---

## 🎯 Objetivo del flujo

Este flujo de trabajo permite:
- Evitar conflictos innecesarios
- Facilitar el trabajo en equipo
- Mantener un historial de cambios claro
- Garantizar una rama principal estable

