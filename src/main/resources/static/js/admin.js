let currentUser = null;
let allUsers = [];
let allRoles = [];

// ========== ИНИЦИАЛИЗАЦИЯ ==========
$(document).ready(function () {
    loadCurrentUser();
    loadAllRoles();
});

// Загрузка текущего пользователя
function loadCurrentUser() {
    $.ajax({
        url: '/api/current-user',
        method: 'GET',
        success: function (user) {
            console.log("API вернул:", user);

            currentUser = user;
            $('#currentUsername').text(user.username);

            // Роли могут быть в поле roles или authorities
            var rolesArray = user.roles || user.authorities || [];

            console.log("Роли:", rolesArray);

            var rolesHtml = '';
            var isAdmin = false;

            for (var i = 0; i < rolesArray.length; i++) {
                var role = rolesArray[i];
                // У角色 может быть поле title или authority
                var roleTitle = role.title || role.authority;
                console.log("Название роли:", roleTitle);

                if (roleTitle === 'ROLE_ADMIN') {
                    isAdmin = true;
                }
                // Показываем роль без префикса ROLE_
                rolesHtml += '<span class="role-badge">' + roleTitle.replace('ROLE_', '') + '</span>';
            }

            $('#currentRoles').html(rolesHtml);
            console.log("isAdmin:", isAdmin);

            if (isAdmin) {
                $('#adminMenuItem').show();
                loadAdminPanel();
            } else {
                loadProfile();
            }
        },
        error: function (xhr) {
            console.error("Ошибка API:", xhr.status);
            window.location.href = '/login';
        }
    });
}

function loadAllRoles() {
    $.ajax({
        url: '/api/roles',
        method: 'GET',
        success: function (roles) {
            allRoles = roles;
        },
        error: function (xhr) {
            console.error('Ошибка загрузки ролей:', xhr.status);
        }
    });
}

// Загрузка админ-панели
function loadAdminPanel() {
    $.ajax({
        url: '/api/users',
        method: 'GET',
        success: function (users) {
            allUsers = users;
            renderAdminPanel(users);
            highlightMenu('admin');
        },
        error: function (xhr) {
            if (xhr.status === 403) {
                showError('Доступ запрещён');
                loadProfile();
            }
        }
    });
}

// Загрузка профиля
function loadProfile() {
    $.ajax({
        url: '/api/current-user',
        method: 'GET',
        success: function (user) {
            renderProfile(user);
            highlightMenu('profile');
        }
    });
}

// ========== ОТРИСОВКА АДМИН-ПАНЕЛИ ==========
function renderAdminPanel(users) {
    var html = `
            <h3 class="mb-4 text-primary">
                <i class="bi bi-shield-lock-fill"></i>
                Панель администратора
            </h3>
            <div class="card">
                <div class="card-header bg-white">
                    <ul class="nav nav-tabs card-header-tabs">
                        <li class="nav-item">
                            <button class="nav-link active" onclick="showTab('users')">
                                <i class="bi bi-table"></i> Список пользователей
                            </button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" onclick="showTab('add-user')">
                                <i class="bi bi-person-plus"></i> Добавить пользователя
                            </button>
                        </li>
                    </ul>
                </div>
                <div class="card-body">
                    <div id="usersTab">
                        ${renderUsersTable(users)}
                    </div>
                    <div id="addUserTab" style="display: none;">
                        ${renderAddUserForm()}
                    </div>
                </div>
            </div>
        `;
    $('#mainContent').html(html);
}

function renderUsersTable(users) {
    if (!users || users.length === 0) {
        return '<div class="text-center text-muted py-4"><i class="bi bi-inbox"></i> Нет пользователей</div>';
    }

    var table = `
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead class="table-primary">
                        <tr>
                            <th>ID</th>
                            <th>Имя</th>
                            <th>Возраст</th>
                            <th>Роли</th>
                            <th colspan="2">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

    users.forEach(function (user) {
        var rolesHtml = '';
        user.authorities.forEach(function (role) {
            rolesHtml += '<span class="badge bg-info me-1">' + role.authority.replace('ROLE_', '') + '</span>';
        });

        table += `
                <tr>
                    <td>${user.id}</td>
                    <td>${escapeHtml(user.username)}</td>
                    <td>${user.age}</td>
                    <td>${rolesHtml}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="openEditModal(${user.id})">
                            <i class="bi bi-pencil"></i> Изменить
                        </button>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger" onclick="openDeleteModal(${user.id})">
                            <i class="bi bi-trash"></i> Удалить
                        </button>
                    </td>
                </tr>
            `;
    });

    table += `</tbody></table></div>`;
    return table;
}

function renderAddUserForm() {
    return `
            <div class="row justify-content-center">
                <div class="col-md-7">
                    <form id="addUserForm">
                        <div class="mb-3">
                            <label class="form-label">Имя пользователя</label>
                            <input type="text" name="username" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Возраст</label>
                            <input type="number" name="age" class="form-control" required min="1" max="150">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Пароль</label>
                            <input type="password" name="password" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Роли пользователя</label>
                              <select class="form-select" name="roleIds" multiple size="2">
                                ${allRoles.map(role => `
                                <option value="${role.id}" ${role.title === 'ROLE_USER' ? 'selected' : ''}>
                                     ${role.title}
                                </option>
                                  `).join('')}
                              </select>
                            <div class="form-text">Зажмите Ctrl для выбора нескольких ролей</div>
                        </div>
                        <button type="submit" class="btn btn-success w-100">Сохранить пользователя</button>
                    </form>
                </div>
            </div>
        `;
}

// ========== ОТРИСОВКА ПРОФИЛЯ ==========
function renderProfile(user) {
    var rolesHtml = '';
    user.authorities.forEach(function (role) {
        rolesHtml += '<span class="badge bg-primary me-1">' + role.authority.replace('ROLE_', '') + '</span>';
    });

    var html = `
            <h3 class="mb-4 text-primary">
                <i class="bi bi-shield-lock-fill"></i>
                Профиль
            </h3>
            <div class="card">
                <div class="card-header bg-white">
                    <h5 class="mb-0">
                        <i class="bi bi-person-circle text-primary"></i>
                        Информация о пользователе
                    </h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle">
                            <thead class="table-primary">
                                <tr><th>ID</th><th>Имя</th><th>Возраст</th><th>Роли</th></tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>${user.id}</td>
                                    <td>${escapeHtml(user.username)}</td>
                                    <td>${user.age}</td>
                                    <td>${rolesHtml}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    $('#mainContent').html(html);
}

// ========== CRUD ОПЕРАЦИИ ==========
function createUser() {
    var formData = $('#addUserForm').serialize();

    $.ajax({
        url: '/api/users',
        method: 'POST',
        data: formData,
        success: function () {
            showToast('Пользователь успешно создан', 'success');
            loadAdminPanel();
        },
        error: function (xhr) {
            showToast('Ошибка: ' + (xhr.responseText || 'Не удалось создать пользователя'), 'danger');
        }
    });
}

function openEditModal(userId) {
    var user = allUsers.find(u => u.id === userId);
    if (!user) return;

    // Заполняем форму
    $('#editUserId').val(user.id);
    $('#editUsername').val(user.username);
    $('#editAge').val(user.age);
    // Очищаем пароль
    var passwordField = document.getElementById('editPassword');
    passwordField.value = '';
    passwordField.blur();
    passwordField.focus();
    // ← ДИНАМИЧЕСКОЕ ЗАПОЛНЕНИЕ РОЛЕЙ
    var roleSelect = document.getElementById('editRolesSelect');
    roleSelect.innerHTML = '';

    allRoles.forEach(function (role) {
        var option = document.createElement('option');
        option.value = role.id;
        option.text = role.title;
        roleSelect.appendChild(option);
    });
// Выбираем роли пользователя
    for (var i = 0; i < roleSelect.options.length; i++) {
        roleSelect.options[i].selected = false;
    }

    user.authorities.forEach(function (role) {
        for (var i = 0; i < roleSelect.options.length; i++) {
            if (roleSelect.options[i].text === role.authority) {
                roleSelect.options[i].selected = true;
                break;
            }
        }
    });

    var editModal = new bootstrap.Modal(document.getElementById('editModal'));
    editModal.show();
}

function updateUser() {
    var userId = $('#editUserId').val();
    var formData = $('#editForm').serialize();

    $.ajax({
        url: '/api/users/' + userId,
        method: 'PUT',
        data: formData,
        success: function () {
            showToast('Пользователь успешно обновлён', 'success');
            bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
            loadAdminPanel();
        },
        error: function (xhr) {
            showToast('Ошибка: ' + (xhr.responseText || 'Не удалось обновить пользователя'), 'danger');
        }
    });
}

function openDeleteModal(userId) {
    var user = allUsers.find(u => u.id === userId);
    if (!user) return;

    $('#deleteUserId').val(user.id);
    $('#deleteUsername').val(user.username);
    $('#deleteAge').val(user.age);

    var rolesDisplay = [];
    user.authorities.forEach(function (role) {
        rolesDisplay.push(role.authority.replace('ROLE_', ''));
    });
    $('#deleteRoles').val(rolesDisplay.join(', '));

    var deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
}

function deleteUser() {
    var userId = $('#deleteUserId').val();

    $.ajax({
        url: '/api/users/' + userId,
        method: 'DELETE',
        success: function () {
            showToast('Пользователь успешно удалён', 'success');
            bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
            loadAdminPanel();
        },
        error: function (xhr) {
            showToast('Ошибка: ' + (xhr.responseText || 'Не удалось удалить пользователя'), 'danger');
        }
    });
}

function logout() {
    $.ajax({
        url: '/logout',
        method: 'POST',
        success: function () {
            window.location.href = '/login';
        }
    });
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function showTab(tabName) {
    if (tabName === 'users') {
        $('#usersTab').show();
        $('#addUserTab').hide();
        $('#usersTab').html(renderUsersTable(allUsers));
    } else {
        $('#usersTab').hide();
        $('#addUserTab').show();
        $('#addUserTab').html(renderAddUserForm());
    }
}

function highlightMenu(page) {
    $('.sidebar .nav-link').removeClass('active');
    if (page === 'admin') {
        $('.sidebar .nav-item:first .nav-link').addClass('active');
    } else {
        $('.sidebar .nav-item:last .nav-link').addClass('active');
    }
}

function showToast(message, type) {
    var toastHtml = `
            <div class="toast align-items-center text-white bg-${type} border-0 position-fixed bottom-0 end-0 m-3" role="alert">
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;
    $('body').append(toastHtml);
    var toast = new bootstrap.Toast($('.toast').last()[0]);
    toast.show();
    setTimeout(function () {
        $('.toast').last().remove();
    }, 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    return $('<div>').text(text).html();
}

// ========== ПОДКЛЮЧАЕМ ОБРАБОТЧИКИ ==========
$(document).on('submit', '#addUserForm', function (e) {
    e.preventDefault();
    createUser();
});

$(document).on('submit', '#editForm', function (e) {
    e.preventDefault();
    updateUser();
});

$(document).on('submit', '#deleteForm', function (e) {
    e.preventDefault();
    deleteUser();
});