async function searchRooms() {
    const building = document.getElementById("building").value;
    const capacity = document.getElementById("capacity").value;

    try {
        let url = "/api/rooms";

        const params = new URLSearchParams();

        if (building) {
            params.append("building", building);
        }

        if (capacity) {
            params.append("min_capacity", capacity);
        }

        if (params.toString()) {
            url += "?" + params.toString();
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Ошибка сервера");
        }

        const rooms = await response.json();

        renderRooms(rooms);

    } catch (error) {
        console.error(error);

        const container = document.getElementById("roomsList");

        container.innerHTML = `
            <div class="empty-state">
                <h3>Ошибка загрузки</h3>
                <p>Не удалось загрузить аудитории.</p>
            </div>
        `;
    }
}


function renderRooms(rooms) {

    const container = document.getElementById("roomsList");
    const counter = document.getElementById("roomCount");

    counter.textContent =
        rooms.length + " аудиторий";


    if (rooms.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>Аудитории не найдены</h3>
                <p>
                    Попробуйте изменить параметры поиска.
                </p>
            </div>
        `;

        return;
    }


    container.innerHTML = rooms.map(room => `

        <div class="room">

            <h3>
                ${room.room_number}
            </h3>

            <p>
                📍 ${room.building}
            </p>

            <p>
                👥 Вместимость:
                ${room.capacity} человек
            </p>

            <p>
                🖥 Оборудование:
                ${room.equipment || "Не указано"}
            </p>

            <span class="status">
                ● Свободна
            </span>

            <button
                onclick="bookRoom(
                    ${room.id},
                    '${room.room_number}'
                )"
            >
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


    if (!name || !name.trim()) {
        return;
    }


    const date =
        document.getElementById("date").value;

    const startTime =
        document.getElementById("startTime").value;

    const endTime =
        document.getElementById("endTime").value;


    if (!date || !startTime || !endTime) {

        alert(
            "Сначала выберите дату, время начала и окончания."
        );

        return;
    }


    const startDateTime =
        `${date}T${startTime}`;

    const endDateTime =
        `${date}T${endTime}`;


    if (endDateTime <= startDateTime) {

        alert(
            "Время окончания должно быть позже времени начала."
        );

        return;
    }


    try {

        const response = await fetch(
            "/api/bookings",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    room_id: roomId,

                    student_name: name.trim(),

                    start_time: startDateTime,

                    end_time: endDateTime

                })
            }
        );


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.error ||
                "Не удалось создать бронирование."
            );

            return;
        }


        alert(
            "✅ Аудитория " +
            roomNumber +
            " успешно забронирована!"
        );


        await searchRooms();

        await loadBookings();


    } catch (error) {

        console.error(error);

        alert(
            "Ошибка соединения с сервером."
        );
    }
}


async function loadBookings() {

    const container =
        document.getElementById("bookingsList");


    try {

        const response =
            await fetch("/api/bookings");


        if (!response.ok) {
            throw new Error("Ошибка сервера");
        }


        const bookings =
            await response.json();


        if (bookings.length === 0) {

            container.innerHTML = `
                <div class="empty-state">
                    <h3>Нет бронирований</h3>

                    <p>
                        Забронированные аудитории
                        появятся здесь.
                    </p>
                </div>
            `;

            return;
        }


        container.innerHTML =
            bookings.map(booking => `

                <div class="room">

                    <h3>
                        ${booking.room_number}
                    </h3>

                    <p>
                        📍 ${booking.building}
                    </p>

                    <p>
                        👤 ${booking.student_name}
                    </p>

                    <p>
                        🕐 ${booking.start_time}
                        — ${booking.end_time}
                    </p>

                    <button
                        onclick="cancelBooking(${booking.id})"
                    >
                        Отменить бронирование
                    </button>

                </div>

            `).join("");


    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="empty-state">
                <h3>Ошибка</h3>
                <p>
                    Не удалось загрузить бронирования.
                </p>
            </div>
        `;
    }
}


async function cancelBooking(bookingId) {

    const confirmed =
        confirm(
            "Вы действительно хотите отменить бронирование?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/bookings/${bookingId}`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.error ||
                "Не удалось отменить бронирование."
            );

            return;
        }


        alert(
            "Бронирование отменено."
        );


        await searchRooms();

        await loadBookings();


    } catch (error) {

        console.error(error);

        alert(
            "Ошибка соединения с сервером."
        );
    }
}


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const dateInput =
            document.getElementById("date");


        if (!dateInput.value) {

            const today =
                new Date()
                    .toISOString()
                    .split("T")[0];

            dateInput.value = today;
        }


        const searchButton =
            document.getElementById("searchButton");


        searchButton.addEventListener(
            "click",
            searchRooms
        );


        searchRooms();

        loadBookings();

    }
);
