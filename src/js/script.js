{
  'use strict';

  const select = {
    templateOf: {
      book: '#template-book',
    },
    containerOf: {
      booksList: '.books-list'
    },
    book: {
      bookImage: '.book__image',
    },
    widgets: {
      filters: {
        sectionFilters: '.filters',
      },
    },
  };

  const templates = {
    book: Handlebars.compile(document.querySelector(select.templateOf.book).innerHTML),
  };

  const classNames = {
    book: {
      bookFavorite: 'favorite',
      bookHidden: 'hidden',
    },
  };

  const settings = {
    arrays: {
      deleteCount: 1,
    },
  };

  class Book {
    constructor(data, bookContainer) {
      const thisBook = this;

      thisBook.id = data.id;
      thisBook.data = data;
      thisBook.dom ={};
      thisBook.dom.bookContainer = bookContainer;
      // console.log(thisBook.data);
    }

    render() {
      const thisBook = this;

      const rating = thisBook.data.rating;
      const ratingBgc = thisBook.determineRatingBgc(rating);
      const ratingWidth = rating* 10;

      thisBook.data.ratingBgc = ratingBgc;
      thisBook.data.ratingWidth = ratingWidth;

      // generate HTMLL based on template
      const generatedHTML = templates.book(thisBook.data);

      // create book element
      thisBook.element = utils.createDOMFromHTML(generatedHTML);

      // add created element to container
      thisBook.dom.bookContainer.appendChild(thisBook.element);
    }

    getElements() {
      const thisBook = this;
      // thisBook.dom = {};

      thisBook.dom.bookImage = thisBook.element.querySelector(select.book.bookImage);
    }

    toggleClassHandler() {
      const thisBook = this;

      if(!thisBook.dom.bookImage.classList.contains(classNames.book.bookFavorite)) {
        thisBook.dom.bookImage.classList.add(classNames.book.bookFavorite);
      } else {
        thisBook.dom.bookImage.classList.remove(classNames.book.bookFavorite);
      }

      thisBook.announce();
    }

    filterBooks(detailData) {
      const thisBook = this;
      const bookDetails = thisBook.data.details;

      for(let paramId in bookDetails) {
        if(bookDetails[paramId] === true && detailData.includes(paramId)) {
          thisBook.dom.bookImage.classList.add(classNames.book.bookHidden);
          return;
        } else {
          thisBook.dom.bookImage.classList.remove(classNames.book.bookHidden);
        }
      }
    }

    determineRatingBgc(rating) {
      if(rating < 6) {
        return 'background: linear-gradient(to bottom,  #fefcea 0%, #f1da36 100%);';
      } else if(rating > 6 && rating <= 8) {
        return 'background: linear-gradient(to bottom, #b4df5b 0%,#b4df5b 100%);';
      } else if(rating > 8 && rating <= 9) {
        return 'background: linear-gradient(to bottom, #299a0b 0%, #299a0b 100%);';
      } else if(rating > 9) {
        return 'background: linear-gradient(to bottom, #ff0084 0%,#ff0084 100%);';
      }
    }

    initActions() {
      const thisBook = this;

      thisBook.element.addEventListener('dblclick', function(event) {
        event.preventDefault();
        thisBook.toggleClassHandler();
      });

      document.body.addEventListener('filter', function(event) {
        const detailData = event.detail;
        thisBook.filterBooks(detailData);
      });
    }

    announce() {
      const thisBook = this;

      const event = new CustomEvent('update', {
        bubbles: true,
        detail: {
          id: thisBook.id,
        }
      });
      thisBook.element.dispatchEvent(event);
    }

    init() {
      const thisBook = this;

      thisBook.render();
      thisBook.getElements();
      thisBook.initActions();
    }
  }

  class FiltersWidget {
    constructor(element) {
      const thisFiltersWidget = this;

      thisFiltersWidget.element = element;
      thisFiltersWidget.filters = [];
    }

    initActions() {
      const thisFiltersWidget = this;

      thisFiltersWidget.element.addEventListener('change', function(event) {
        thisFiltersWidget.setValue(event);
      });
    }

    setValue(event) {
      const thisFiltersWidget = this;
      const element = event.target;
      const condision = typeof element === 'object' && element.nodeName === 'INPUT' && element.type === 'checkbox' && element.name === 'filter';

      if(condision) {
        if(element.checked && !thisFiltersWidget.filters.includes(element.value)) {
          thisFiltersWidget.filters.push(element.value);
        } else {
          const index = thisFiltersWidget.filters.indexOf(element.value);
          thisFiltersWidget.filters.splice(index, settings.arrays.deleteCount);
        }
      }

      thisFiltersWidget.filter();
    }

    filter() {
      const thisFiltersWidget = this;

      const event = new CustomEvent('filter', {
        bubbles: true,
        detail: thisFiltersWidget.filters,
      });
      thisFiltersWidget.element.dispatchEvent(event);
    }

    init() {
      const thisFiltersWidget = this;

      thisFiltersWidget.initActions();
    }
  }

  class BooksList {
    constructor(data) {
      const thisBooksList = this;

      thisBooksList.data = data;
      thisBooksList.favoriteBooks = [];
    }

    getElements() {
      const thisBooksList = this;

      thisBooksList.dom = {};
      thisBooksList.dom.element = document.querySelector(select.containerOf.booksList);
      thisBooksList.dom.filterWidget = document.querySelector(select.widgets.filters.sectionFilters);
    }

    initFiltersWidget() {
      const thisBooksList = this;

      thisBooksList.filtersWidget = new FiltersWidget(thisBooksList.dom.filterWidget);
      thisBooksList.filtersWidget.init();
    }

    initBooks(booksData) {
      const thisBooksList = this;

      for(let bookData of booksData) {
        const book = new Book(bookData, thisBooksList.dom.element);
        book.init();
      }
    }

    initActions() {
      const thisBooksList = this;

      thisBooksList.dom.element.addEventListener('update', function(event) {
        const id = event.detail.id;
        thisBooksList.update(id);
      });

    }

    update(id) {
      const thisBooksList = this;

      // if book is added to favorite then add bookId to array favoriteBooks else remove bookId from array favoriteBooks
      if(!thisBooksList.favoriteBooks.includes(id)) {
        thisBooksList.favoriteBooks.push(id);
      } else {
        const index = thisBooksList.favoriteBooks.indexOf(id);
        thisBooksList.favoriteBooks.splice(index, settings.arrays.deleteCount);
      }
    }

    init() {
      const thisBooksList = this;

      thisBooksList.getElements();
      thisBooksList.initBooks(thisBooksList.data.books);
      thisBooksList.initActions();
      thisBooksList.initFiltersWidget();
    }
  }

  const app = new BooksList(dataSource);

  app.init();

}

