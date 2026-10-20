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

            <button onclick="bookRoom(${room.id}, '${room.room_number}')">
                Забронировать
            </button>
        </div>
    `).join("");
}


async function bookRoom(roomId, roomNumber) {

    const name = prompt(
        "Введите ваше имя для бронирования аудитории " +
        roomNumber
    );

    if (!name) {
        return;
    }

    const date = document.getElementById("date").value;
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;

    if (!date || !startTime || !endTime) {
        alert(
            "Сначала выберите дату, время начала и время окончания."
        );
        return;
    }

    const startTimeValue = `${date}T${startTime}`;
    const endTimeValue = `${date}T${endTime}`;

    if (endTimeValue <= startTimeValue) {
        alert("Время окончания должно быть позже времени начала.");
        return;
    }

    try {
        const response = await fetch("/api/bookings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                room_id: roomId,
                student_name: name,
                start_time: startTimeValue,
                end_time: endTimeValue
            })
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Не удалось создать бронирование.");
            return;
        }

        alert(
            "✅ Аудитория " +
            roomNumber +
            " успешно забронирована для " +
            name +
            "!"
        );

        searchRooms();

    } catch (error) {
        console.error(error);
        alert("Ошибка соединения с сервером.");
    }
}


document.addEventListener("DOMContentLoaded", () => {
    searchRooms();
});
