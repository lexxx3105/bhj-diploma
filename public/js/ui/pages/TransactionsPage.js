/**
 * Класс TransactionsPage управляет
 * страницей отображения доходов и
 * расходов конкретного счёта
 * */
class TransactionsPage {
  /**
   * Если переданный элемент не существует,
   * необходимо выкинуть ошибку.
   * Сохраняет переданный элемент и регистрирует события
   * через registerEvents()
   * */
  constructor(element) {
    if (!element) {
      throw new Error(`Элемент не существует`);
    }
    this.element = element;
    this.registerEvents();
    this.lastOptions = {};
  }

  /**
   * Вызывает метод render для отрисовки страницы
   * */
  update() {
    this.render(this.lastOptions);

  }

  /**
   * Отслеживает нажатие на кнопку удаления транзакции
   * и удаления самого счёта. Внутри обработчика пользуйтесь
   * методами TransactionsPage.removeTransaction и
   * TransactionsPage.removeAccount соответственно
   * */
  registerEvents() {

    this.element.addEventListener(`click`, (e) => {
      if (e.target.closest(`.remove-account`)) {
        this.removeAccount();

      } else if (e.target.closest(`.transaction__remove`)) {

        this.removeTransaction({
          id: e.target.closest(`.transaction__remove`).dataset.id
        });
      }

    });
  }

  /**
   * Удаляет счёт. Необходимо показать диалоговое окно (с помощью confirm())
   * Если пользователь согласен удалить счёт, вызовите
   * Account.remove, а также TransactionsPage.clear с
   * пустыми данными для того, чтобы очистить страницу.
   * По успешному удалению необходимо вызвать метод App.updateWidgets(),
   * либо обновляйте только виджет со счетами
   * для обновления приложения
   * */
  removeAccount() {
    if (!this.lastOptions) {
      return;
    }
    if (confirm(`Вы действительно хотите удалить счёт?`)) {
      Account.remove({
        id: this.lastOptions.account_id
      }, (err, response) => {
        if (response.success) {
          this.clear();
          App.updateWidgets();
        }
      });
    }
  }

  /**
   * Удаляет транзакцию (доход или расход). Требует
   * подтверждения действия (с помощью confirm()).
   * По удалению транзакции вызовите метод App.update(),
   * либо обновляйте текущую страницу (метод update) и виджет со счетами
   * */
  removeTransaction(id) {
    if (confirm(`Вы действительно хотите удалить эту транзакцию?`)) {
      Transaction.remove(id, (err, response) => {
        if (response.success) {
          App.update();
        }
      })
    }

  }

  /**
   * С помощью Account.get() получает название счёта и отображает
   * его через TransactionsPage.renderTitle.
   * Получает список Transaction.list и полученные данные передаёт
   * в TransactionsPage.renderTransactions()
   * */
  render(options) {
    if (!options) {
      return;
    }
    this.lastOptions = options;
    Account.get(options.account_id, (err, response) => {
      if (response.success && response.data.name) {
        this.renderTitle(response);
      }
    });
    Transaction.list(options, (err, response) => {
      if (response && response.data) {
        this.renderTransactions(response.data);
      }
    })

  }

  /**
   * Очищает страницу. Вызывает
   * TransactionsPage.renderTransactions() с пустым массивом.
   * Устанавливает заголовок: «Название счёта»
   * */
  clear() {
    
    this.renderTransactions([]);
    document.querySelector(`.content-title`).textContent = `Название счёта`;
    this.lastOptions = {};
  }

  /**
   * Устанавливает заголовок в элемент .content-title
   * */
  renderTitle(name) {
    document.querySelector(`.content-title`).textContent = `${name.data.name}`;

  }

  /**
   * Форматирует дату в формате 2019-03-10 03:20:41 (строка)
   * в формат «10 марта 2019 г. в 03:20»
   * */
  formatDate(date) {
    const d = new Date(date),
      month = [`января`, `февраля`, `марта`, `апреля`, `мая`, `июня`, `июля`, `августа`, `сентября`, `октября`, `ноября`, `декабря`],
      option = {
        hour: `2-digit`,
        minute: `2-digit`
      }

    return `${d.getDate()} ${month[d.getMonth()]} ${d.getFullYear()} г. в ${new Intl.DateTimeFormat(`ru-RU`, option).format(d )}`;
  }

  /**
   * Формирует HTML-код транзакции (дохода или расхода).
   * item - объект с информацией о транзакции
   * */
  getTransactionHTML(item) {
    const elem = document.createElement(`div`);
    elem.classList.add(`transaction`,
      `row`, `transaction_${item.type}`);
    elem.insertAdjacentHTML(`afterbegin`, ` <div class="col-md-7 transaction__details">
      <div class="transaction__icon">
          <span class="fa fa-money fa-2x"></span>
      </div>
      <div class="transaction__info">
          <h4 class="transaction__title">${item.name}</h4>
          
          <div class="transaction__date">${this.formatDate(item.created_at)}</div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="transaction__sum">
      
          ${item.sum} <span class="currency">₽</span>
      </div>
    </div>
    <div class="col-md-2 transaction__controls">
        
        <button class="btn btn-danger transaction__remove" data-id="${item.id}">
            <i class="fa fa-tr fa-trash"></i>  
        </button>
    </div>`);
    return elem;

  }

  /**
   * Отрисовывает список транзакций на странице
   * используя getTransactionHTML
   * */
  renderTransactions(data) {
    const transactionsHTML = data.reduce((html, transaction) => {
      const transactionHTML = this.getTransactionHTML(transaction);
      return html + transactionHTML.outerHTML;
    }, '');

    document.querySelector('.content').innerHTML = transactionsHTML;
  }
}