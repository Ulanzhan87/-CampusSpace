async function searchRooms() {
    const building = document.getElementById("building").value;
    const capacity = document.getElementById("capacity").value;

    try {
        const response = await fetch("/api/rooms");

        if (!response.ok) {
            throw new Error("Ошибка сервера");
        }

        const rooms = await response.json();

        const filtered = rooms.filter(room => {
            const buildingMatch =
                !building || room.building === building;

            const capacityMatch =
                !capacity || room.capacity >= Number(capacity);

            return buildingMatch && capacityMatch;
        });

        renderRooms(filtered);

    } catch (error) {
        alert("Не удалось загрузить аудитории.");
        console.error(error);
    }
}


function renderRooms(rooms) {
    const container = document.getElementById("rooms");

    if (rooms.length === 0) {
        container.innerHTML =
            "<p>Свободных аудиторий не найдено.</p>";
        return;
    }

    container.innerHTML = rooms.map(room => `
        <div class="room">
            <h3>${room.room_number}</h3>

            <p>📍 ${room.building}</p>

            <p>👥 Вместимость: ${room.capacity}</p>

            <p>🖥 ${room.equipment || "Не указано"}</p>

            <span class="status">Свободна</span>

            <button onclick="bookRoom('${room.room_number}')">
                Забронировать
            </button>
        </div>
    `).join("");
}


function bookRoom(roomNumber) {
    const name = prompt(
        "Введите ваше имя для бронирования аудитории " +
        roomNumber
    );

    if (!name) {
        return;
    }

    alert(
        "Заявка на бронирование аудитории " +
        roomNumber +
        " создана для " +
        name +
        "."
    );
}
