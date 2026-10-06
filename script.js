const isbnInput = document.getElementById("isbnInput");
const searchBookBtn = document.getElementById("searchBookBtn");

const message = document.getElementById("message");

const manualSearch = document.getElementById("manualSearch");
const titleInput = document.getElementById("titleInput");
const authorInput = document.getElementById("authorInput");
const searchByTitleBtn = document.getElementById("searchByTitleBtn");

const bookPreview = document.getElementById("bookPreview");
const booksContainer = document.getElementById("books");

const showAllBtn = document.getElementById("showAllBtn");
const showUnreadBtn = document.getElementById("showUnreadBtn");
const showReadBtn = document.getElementById("showReadBtn");

const librarySearch = document.getElementById("librarySearch");

let currentFilter = "all";

let books = JSON.parse(localStorage.getItem("myBooks")) || [];


// ==================================================
// STILE MENU PERSONALIZZATO
// ==================================================

const customStatusStyle = document.createElement("style");

customStatusStyle.textContent = `
  .custom-status-wrapper {
    position: relative;
    flex-shrink: 0;
  }

  .custom-status-button {
    min-width: 125px;
    height: 34px;
    padding: 0 10px;
    border: 1px solid #ded5c8;
    border-radius: 9px;
    background: #f0e8dc;
    color: #80694e;
    font-family: "DM Sans", sans-serif;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    white-space: nowrap;
  }

  .custom-status-button:hover {
    border-color: #cbbba5;
  }

  .custom-status-arrow {
    font-size: 9px;
    transition: transform 0.2s ease;
  }

  .custom-status-wrapper.open .custom-status-arrow {
    transform: rotate(180deg);
  }

  .custom-status-menu {
    position: absolute;
    top: calc(100% + 5px);
    right: 0;
    z-index: 1000;
    min-width: 150px;
    padding: 5px;
    border: 1px solid #ded5c8;
    border-radius: 10px;
    background: #fffdf9;
    box-shadow: 0 8px 22px rgba(65, 53, 38, 0.13);
    display: none;
  }

  .custom-status-wrapper.open .custom-status-menu {
    display: block;
  }

  .custom-status-option {
    width: 100%;
    padding: 9px 10px;
    border: 0;
    border-radius: 7px;
    background: transparent;
    color: #685b4d;
    font-family: "DM Sans", sans-serif;
    font-size: 11px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
  }

  .custom-status-option:hover {
    background: #f3ede4;
  }

  @media (max-width: 700px) {
    .custom-status-button {
      min-width: 112px;
      height: 32px;
      font-size: 10px;
    }

    .custom-status-menu {
      min-width: 140px;
    }
  }
`;

document.head.appendChild(customStatusStyle);


// ==================================================
// SALVA LIBRI
// ==================================================

function saveBooks() {
  localStorage.setItem("myBooks", JSON.stringify(books));
}


// ==================================================
// ESCAPE HTML
// ==================================================

function escapeHtml(text) {

  if (text === null || text === undefined) {
    return "";
  }

  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ==================================================
// MOSTRA LIBRI
// ==================================================

function renderBooks() {

  booksContainer.innerHTML = "";

  const searchText =
    librarySearch.value.trim().toLowerCase();

  const filteredBooks = books
    .map(function(book, index) {
      return {
        book: book,
        index: index
      };
    })
    .filter(function(item) {

      const book = item.book;

      const matchesStatus =
        currentFilter === "all" ||
        (
          currentFilter === "read" &&
          book.status === "Letto"
        ) ||
        (
          currentFilter === "unread" &&
          book.status === "Da leggere"
        );

      const matchesSearch =
        !searchText ||
        (book.title || "").toLowerCase().includes(searchText) ||
        (book.author || "").toLowerCase().includes(searchText) ||
        (book.isbn || "").toLowerCase().includes(searchText);

      return matchesStatus && matchesSearch;
    });


  if (filteredBooks.length === 0) {

    booksContainer.innerHTML =
      "<p>📚 Nessun libro trovato.</p>";

    return;
  }


  filteredBooks.forEach(function(item) {

    const book = item.book;
    const index = item.index;

    const bookElement =
      document.createElement("div");

    bookElement.className = "book";


    const currentStatus =
      book.status === "Letto"
        ? "📗 Letto"
        : "📕 Da leggere";


    bookElement.innerHTML = `
      <div class="book-summary">

        <div class="book-info">

          <h3>
            ${escapeHtml(book.title)}
          </h3>

          <p>
            ${escapeHtml(
              book.author || "Autore non disponibile"
            )}
          </p>

        </div>

        <div class="custom-status-wrapper">

          <button
            type="button"
            class="custom-status-button"
          >
            <span class="custom-status-text">
              ${currentStatus}
            </span>

            <span class="custom-status-arrow">
              ▾
            </span>
          </button>

          <div class="custom-status-menu">

            <button
              type="button"
              class="custom-status-option"
              data-status="Da leggere"
            >
              📕 Da leggere
            </button>

            <button
              type="button"
              class="custom-status-option"
              data-status="Letto"
            >
              📗 Letto
            </button>

          </div>

        </div>

      </div>


      <div class="book-details hidden">

        <div class="detail-row">

          <span>🔢 ISBN</span>

          <strong>
            ${escapeHtml(
              book.isbn || "Non disponibile"
            )}
          </strong>

        </div>


        <div class="detail-row">

          <span>📄 Pagine</span>

          <strong>
            ${book.pages || "Non disponibili"}
          </strong>

        </div>


        <div class="detail-row">

          <span>🏷️ Genere</span>

          <strong>
            ${escapeHtml(
              book.genre || "Non disponibile"
            )}
          </strong>

        </div>


        <div class="detail-row">

          <span>🏢 Casa editrice</span>

          <strong>
            ${escapeHtml(
              book.publisher || "Non disponibile"
            )}
          </strong>

        </div>


        <div class="book-buttons">

          <button
            class="edit"
            data-index="${index}"
          >
            ✏️ Modifica
          </button>

          <button
            class="delete"
            data-index="${index}"
          >
            🗑️ Elimina
          </button>

        </div>

      </div>
    `;


    const summary =
      bookElement.querySelector(".book-summary");

    const details =
      bookElement.querySelector(".book-details");

    const statusWrapper =
      bookElement.querySelector(
        ".custom-status-wrapper"
      );

    const statusButton =
      bookElement.querySelector(
        ".custom-status-button"
      );

    const statusOptions =
      bookElement.querySelectorAll(
        ".custom-status-option"
      );


    // ==================================================
    // APRI / CHIUDI DETTAGLI
    // ==================================================

    summary.addEventListener("click", function(event) {

      if (
        event.target.closest(".custom-status-wrapper")
      ) {
        return;
      }

      details.classList.toggle("hidden");

    });


    // ==================================================
    // APRI MENU STATO
    // ==================================================

    statusButton.addEventListener("click", function(event) {

      event.stopPropagation();

      document
        .querySelectorAll(".custom-status-wrapper.open")
        .forEach(function(wrapper) {

          if (wrapper !== statusWrapper) {
            wrapper.classList.remove("open");
          }

        });

      statusWrapper.classList.toggle("open");

    });


    // ==================================================
    // CAMBIA STATO
    // ==================================================

    statusOptions.forEach(function(option) {

      option.addEventListener("click", function(event) {

        event.stopPropagation();

        const newStatus =
          option.dataset.status;

        books[index].status =
          newStatus;

        saveBooks();

        renderBooks();

      });

    });


    booksContainer.appendChild(bookElement);

  });


  addBookEvents();
}


// ==================================================
// CHIUDI MENU CLICCANDO FUORI
// ==================================================

document.addEventListener("click", function() {

  document
    .querySelectorAll(".custom-status-wrapper.open")
    .forEach(function(wrapper) {

      wrapper.classList.remove("open");

    });

});


// ==================================================
// EVENTI MODIFICA / ELIMINA
// ==================================================

function addBookEvents() {

  const editButtons =
    document.querySelectorAll(".edit");


  editButtons.forEach(function(button) {

    button.addEventListener("click", function(event) {

      event.stopPropagation();

      const index =
        Number(button.dataset.index);

      editBook(index);

    });

  });


  const deleteButtons =
    document.querySelectorAll(".delete");


  deleteButtons.forEach(function(button) {

    button.addEventListener("click", function(event) {

      event.stopPropagation();

      const index =
        Number(button.dataset.index);

      deleteBook(index);

    });

  });

}


// ==================================================
// MODIFICA LIBRO
// ==================================================

function editBook(index) {

  const book = books[index];

  const bookElements =
    document.querySelectorAll(".book");

  let bookElement = null;


  bookElements.forEach(function(element) {

    const editButton =
      element.querySelector(".edit");

    if (
      editButton &&
      Number(editButton.dataset.index) === index
    ) {
      bookElement = element;
    }

  });


  if (!bookElement) {
    return;
  }


  bookElement.innerHTML = `
    <h3>✏️ Modifica libro</h3>

    <label>
      <strong>Titolo</strong>
    </label>

    <input
      type="text"
      id="editTitle"
      value="${escapeHtml(book.title || "")}"
    >


    <label>
      <strong>Autore</strong>
    </label>

    <input
      type="text"
      id="editAuthor"
      value="${escapeHtml(book.author || "")}"
    >


    <label>
      <strong>ISBN</strong>
    </label>

    <input
      type="text"
      id="editISBN"
      value="${escapeHtml(book.isbn || "")}"
    >


    <label>
      <strong>Pagine</strong>
    </label>

    <input
      type="number"
      id="editPages"
      value="${book.pages || ""}"
      placeholder="Numero di pagine"
    >


    <label>
      <strong>Genere</strong>
    </label>

    <input
      type="text"
      id="editGenre"
      value="${escapeHtml(book.genre || "")}"
      placeholder="Es. Fantasy, Romance..."
    >


    <label>
      <strong>Casa editrice</strong>
    </label>

    <input
      type="text"
      id="editPublisher"
      value="${escapeHtml(book.publisher || "")}"
      placeholder="Casa editrice"
    >


    <div class="book-buttons">

      <button
        class="edit"
        id="saveEdit"
      >
        💾 Salva
      </button>

      <button
        class="delete"
        id="cancelEdit"
      >
        ❌ Annulla
      </button>

    </div>
  `;


  document
    .getElementById("saveEdit")
    .addEventListener("click", function() {

      const newTitle =
        document
          .getElementById("editTitle")
          .value
          .trim();

      const newAuthor =
        document
          .getElementById("editAuthor")
          .value
          .trim();

      const newISBN =
        document
          .getElementById("editISBN")
          .value
          .trim();

      const newPages =
        document
          .getElementById("editPages")
          .value
          .trim();

      const newGenre =
        document
          .getElementById("editGenre")
          .value
          .trim();

      const newPublisher =
        document
          .getElementById("editPublisher")
          .value
          .trim();


      if (!newTitle) {

        alert(
          "Il titolo non può essere vuoto."
        );

        return;
      }


      book.title =
        newTitle;

      book.author =
        newAuthor || "Non specificato";

      book.isbn =
        newISBN || "Non disponibile";

      book.pages =
        newPages || "";

      book.genre =
        newGenre || "";

      book.publisher =
        newPublisher || "";


      saveBooks();

      renderBooks();

    });


  document
    .getElementById("cancelEdit")
    .addEventListener("click", function() {

      renderBooks();

    });

}


// ==================================================
// ELIMINA LIBRO
// ==================================================

function deleteBook(index) {

  const book = books[index];


  const confirmed =
    confirm(
      'Vuoi eliminare "' +
      book.title +
      '"?'
    );


  if (!confirmed) {
    return;
  }


  books.splice(index, 1);

  saveBooks();

  renderBooks();

}


// ==================================================
// CERCA TRAMITE ISBN
// ==================================================

searchBookBtn.addEventListener(
  "click",
  function() {

    searchByISBN();

  }
);


isbnInput.addEventListener(
  "keydown",
  function(event) {

    if (event.key === "Enter") {
      searchByISBN();
    }

  }
);


async function searchByISBN() {

  const isbn =
    isbnInput.value
      .trim()
      .replace(/[-\s]/g, "");

  if (!isbn) {
    message.textContent =
      "⚠️ Inserisci un ISBN.";
    return;
  }

  message.textContent =
    "🔎 Sto cercando il libro...";

  bookPreview.classList.add("hidden");
  bookPreview.innerHTML = "";

  try {

    const response =
      await fetch(
        "/.netlify/functions/search-book?isbn=" +
        encodeURIComponent(isbn)
      );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.found ||
      !data.book
    ) {

      message.textContent =
        "❌ Non ho trovato il libro tramite ISBN.";

      showManualBookForm();

      return;
    }

    const book =
      data.book;

    showBookPreview({

      title:
        book.title ||
        "Titolo non disponibile",

      author:
        book.author ||
        "Autore non disponibile",

      isbn:
        book.isbn ||
        isbn,

      pages:
        book.pages ||
        "",

      genre:
        book.genre ||
        "",

      publisher:
        book.publisher ||
        "",

      publishedDate:
        book.publishedDate ||
        ""

    });

    message.textContent =
      "✅ Libro trovato!";

  } catch (error) {

    console.error(error);

    message.textContent =
      "❌ Errore durante la ricerca.";

    showManualBookForm();
  }
}


    showBookPreview({

      title: title,

      author: author,

      isbn: isbn

    });


    message.textContent =
      "✅ Libro trovato!";


  } catch (error) {

    console.error(error);


    message.textContent =
      "❌ Errore durante la ricerca.";


    showManualBookForm();

  }

}


// ==================================================
// MOSTRA ANTEPRIMA
// ==================================================

function showBookPreview(book) {

  bookPreview.classList.remove("hidden");


  bookPreview.innerHTML = `
    <h2>
      ${escapeHtml(book.title)}
    </h2>

    <p>
      <strong>Autore:</strong>
      ${escapeHtml(book.author)}
    </p>

    <p>
      <strong>ISBN:</strong>
      ${escapeHtml(book.isbn)}
    </p>

    <button id="addBookBtn">
      ➕ Aggiungi alla biblioteca
    </button>
  `;


  document
    .getElementById("addBookBtn")
    .addEventListener(
      "click",
      function() {

        addBook(book);

      }
    );

}


// ==================================================
// AGGIUNGI LIBRO
// ==================================================

function addBook(book) {

  const alreadyExists =
    books.some(function(existingBook) {

      return (
        existingBook.isbn ===
        book.isbn
      );

    });


  if (alreadyExists) {

    message.textContent =
      "⚠️ Questo libro è già nella tua biblioteca.";

    return;
  }


  books.push({

    title:
      book.title,

    author:
      book.author,

    isbn:
      book.isbn,

    pages:
      book.pages || "",

    genre:
      book.genre || "",

    publisher:
      book.publisher || "",

    status:
      "Da leggere"

  });


  saveBooks();

  renderBooks();


  bookPreview.classList.add("hidden");

  bookPreview.innerHTML = "";


  message.textContent =
    "✅ Libro aggiunto alla biblioteca!";

}


// ==================================================
// CERCA PER TITOLO / AUTORE
// ==================================================

searchByTitleBtn.addEventListener(
  "click",
  function() {

    searchByTitleOrAuthor();

  }
);


async function searchByTitleOrAuthor() {

  const title =
    titleInput.value.trim();

  const author =
    authorInput.value.trim();


  if (!title && !author) {

    message.textContent =
      "⚠️ Inserisci almeno il titolo o l'autore.";

    return;
  }


  message.textContent =
    "🔎 Sto cercando...";


  bookPreview.classList.add("hidden");
  bookPreview.innerHTML = "";


  try {

    let url = "";


    if (title && !author) {

      url =
        "https://openlibrary.org/search.json?title=" +
        encodeURIComponent(title) +
        "&limit=20";

    } else if (!title && author) {

      url =
        "https://openlibrary.org/search.json?author=" +
        encodeURIComponent(author) +
        "&limit=20";

    } else {

      url =
        "https://openlibrary.org/search.json?title=" +
        encodeURIComponent(title) +
        "&author=" +
        encodeURIComponent(author) +
        "&limit=20";

    }


    const response =
      await fetch(url);


    if (!response.ok) {

      throw new Error(
        "Errore HTTP " +
        response.status
      );

    }


    const data =
      await response.json();


    if (
      !data.docs ||
      data.docs.length === 0
    ) {

      message.textContent =
        "❌ Non ho trovato nessun libro.";

      showManualBookForm();

      return;
    }


    const results =
      data.docs.filter(function(book) {

        const bookTitle =
          (book.title || "")
            .toLowerCase();


        const bookAuthors =
          book.author_name
            ? book.author_name
                .join(" ")
                .toLowerCase()
            : "";


        const titleOK =
          !title ||
          bookTitle.includes(
            title.toLowerCase()
          );


        const authorOK =
          !author ||
          bookAuthors.includes(
            author.toLowerCase()
          );


        return titleOK && authorOK;

      });


    if (results.length === 0) {

      message.textContent =
        "❌ Non ho trovato risultati pertinenti.";

      showManualBookForm();

      return;
    }


    message.textContent =
      "✅ Trovati " +
      results.length +
      " risultati pertinenti.";


    showSearchResults(results);


  } catch (error) {

    console.error(error);


    message.textContent =
      "❌ Errore durante la ricerca.";


    showManualBookForm();

  }

}


// ==================================================
// INSERIMENTO MANUALE
// ==================================================

function showManualBookForm() {

  bookPreview.classList.remove("hidden");


  bookPreview.innerHTML = `
    <h2>
      📖 Inserisci il libro manualmente
    </h2>

    <input
      type="text"
      id="manualTitle"
      placeholder="Titolo del libro"
    >

    <input
      type="text"
      id="manualAuthor"
      placeholder="Autore"
    >

    <input
      type="text"
      id="manualISBN"
      placeholder="ISBN (facoltativo)"
    >

    <button id="saveManualBookBtn">
      ➕ Aggiungi alla biblioteca
    </button>
  `;


  document
    .getElementById("saveManualBookBtn")
    .addEventListener(
      "click",
      function() {

        const manualTitle =
          document
            .getElementById("manualTitle")
            .value
            .trim();


        const manualAuthor =
          document
            .getElementById("manualAuthor")
            .value
            .trim();


        const manualISBN =
          document
            .getElementById("manualISBN")
            .value
            .trim();


        if (!manualTitle) {

          alert(
            "Inserisci almeno il titolo del libro."
          );

          return;
        }


        addBook({

          title:
            manualTitle,

          author:
            manualAuthor ||
            "Non specificato",

          isbn:
            manualISBN ||
            "Non disponibile"

        });

      }
    );

}


// ==================================================
// MOSTRA RISULTATI RICERCA
// ==================================================

function showSearchResults(results) {

  bookPreview.classList.remove("hidden");


  bookPreview.innerHTML =
    "<h2>📚 Risultati della ricerca</h2>";


  results.forEach(function(result) {

    const title =
      result.title ||
      "Titolo non disponibile";


    const author =
      result.author_name
        ? result.author_name.join(", ")
        : "Autore non disponibile";


    let isbn = "";


    if (
      result.isbn &&
      result.isbn.length > 0
    ) {

      isbn =
        result.isbn[0];

    } else {

      isbn =
        "Non disponibile";

    }


    const resultElement =
      document.createElement("div");


    resultElement.className =
      "search-result";


    resultElement.innerHTML = `
      <h3>
        ${escapeHtml(title)}
      </h3>

      <p>
        <strong>Autore:</strong>
        ${escapeHtml(author)}
      </p>

      <p>
        <strong>ISBN:</strong>
        ${escapeHtml(isbn)}
      </p>

      <button>
        ➕ Aggiungi
      </button>
    `;


    resultElement
      .querySelector("button")
      .addEventListener(
        "click",
        function() {

          addBook({

            title: title,

            author: author,

            isbn: isbn

          });

        }
      );


    bookPreview.appendChild(
      resultElement
    );

  });


  const manualButton =
    document.createElement("button");


  manualButton.textContent =
    "✏️ Inserisci manualmente";


  manualButton.style.marginTop =
    "15px";


  manualButton.style.width =
    "100%";


  manualButton.addEventListener(
    "click",
    function() {

      showManualBookForm();

    }
  );


  bookPreview.appendChild(
    manualButton
  );

}


// ==================================================
// FILTRI
// ==================================================

showAllBtn.addEventListener(
  "click",
  function() {

    currentFilter = "all";

    updateFilterButtons();

    renderBooks();

  }
);


showUnreadBtn.addEventListener(
  "click",
  function() {

    currentFilter = "unread";

    updateFilterButtons();

    renderBooks();

  }
);


showReadBtn.addEventListener(
  "click",
  function() {

    currentFilter = "read";

    updateFilterButtons();

    renderBooks();

  }
);


// ==================================================
// RICERCA NELLA BIBLIOTECA
// ==================================================

librarySearch.addEventListener(
  "input",
  function() {

    renderBooks();

  }
);


// ==================================================
// AGGIORNA FILTRI
// ==================================================

function updateFilterButtons() {

  showAllBtn.classList.remove("active");

  showUnreadBtn.classList.remove("active");

  showReadBtn.classList.remove("active");


  if (currentFilter === "all") {

    showAllBtn.classList.add("active");

  }


  if (currentFilter === "unread") {

    showUnreadBtn.classList.add("active");

  }


  if (currentFilter === "read") {

    showReadBtn.classList.add("active");

  }

}


// ==================================================
// AVVIO
// ==================================================

renderBooks();
const exportBooksBtn = document.getElementById("exportBooksBtn");
const importBooksBtn = document.getElementById("importBooksBtn");
const importBooksInput = document.getElementById("importBooksInput");

exportBooksBtn.addEventListener("click", function() {
  const data = JSON.stringify(books, null, 2);

  const blob = new Blob([data], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "la-mia-biblioteca.json";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
});

importBooksBtn.addEventListener("click", function() {
  importBooksInput.click();
});

importBooksInput.addEventListener("change", function(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const importedBooks = JSON.parse(e.target.result);

      if (!Array.isArray(importedBooks)) {
        alert("Il file non contiene una biblioteca valida.");
        return;
      }

      books = importedBooks;

      saveBooks();
      renderBooks();

      alert("Biblioteca importata con successo! 📚");
    } catch (error) {
      alert("Non è stato possibile importare questo file.");
    }

    importBooksInput.value = "";
  };

  reader.readAsText(file);
});
// ===============================
// SCANNER ISBN
// ===============================

const scanIsbnBtn = document.getElementById("scanIsbnBtn");
const scannerContainer = document.getElementById("scannerContainer");
const closeScannerBtn = document.getElementById("closeScannerBtn");

let html5QrCode = null;
let scannerRunning = false;

async function closeScanner() {
  if (html5QrCode && scannerRunning) {
    try {
      await html5QrCode.stop();
    } catch (error) {
      console.log("Scanner già fermo.");
    }

    try {
      html5QrCode.clear();
    } catch (error) {
      console.log("Scanner già pulito.");
    }
  }

  html5QrCode = null;
  scannerRunning = false;

  scannerContainer.classList.add("hidden");
}

scanIsbnBtn.addEventListener("click", async function() {
  scannerContainer.classList.remove("hidden");

  html5QrCode = new Html5Qrcode("reader");

  try {
    await html5QrCode.start(
      { facingMode: "environment" },

      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 150
        }
      },

      async function(decodedText) {

        const isbn = decodedText.replace(/[^0-9Xx]/g, "");

        if (isbn.length !== 10 && isbn.length !== 13) {
          return;
        }

        isbnInput.value = isbn;

        await closeScanner();

        searchBookBtn.click();
      },

      function(errorMessage) {
        // Ignora gli errori di scansione mentre cerca il codice
      }
    );

    scannerRunning = true;

  } catch (error) {

    scannerContainer.classList.add("hidden");

    alert(
      "Non riesco ad aprire la fotocamera. Controlla di aver dato a Chrome il permesso di usare la fotocamera."
    );

    console.error(error);
  }
});

closeScannerBtn.addEventListener("click", function() {
  closeScanner();
});
