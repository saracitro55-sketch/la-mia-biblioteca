exports.handler = async function(event) {

  const isbn = (event.queryStringParameters?.isbn || "")
    .replace(/[-\s]/g, "")
    .trim();

  if (!isbn) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "ISBN mancante"
      })
    };
  }

  let googleBook = null;
  let openLibraryBook = null;

  // ===============================
  // GOOGLE BOOKS
  // ===============================

  try {

    const googleUrl =
      "https://www.googleapis.com/books/v1/volumes?q=isbn:" +
      encodeURIComponent(isbn) +
      "&maxResults=10&country=IT";

    const response = await fetch(googleUrl);

    if (response.ok) {

      const data = await response.json();

      if (data.items && data.items.length > 0) {

        googleBook = data.items[0].volumeInfo;

      }
    }

  } catch (error) {

    console.log(
      "Google Books non disponibile:",
      error
    );

  }

  // ===============================
  // OPEN LIBRARY
  // ===============================

  try {

    const openLibraryUrl =
      "https://openlibrary.org/search.json?isbn=" +
      encodeURIComponent(isbn) +
      "&limit=10";

    const response = await fetch(openLibraryUrl);

    if (response.ok) {

      const data = await response.json();

      if (data.docs && data.docs.length > 0) {

        openLibraryBook = data.docs[0];

      }
    }

  } catch (error) {

    console.log(
      "Open Library non disponibile:",
      error
    );

  }

  // ===============================
  // NESSUN RISULTATO
  // ===============================

  if (!googleBook && !openLibraryBook) {

    return {
      statusCode: 404,
      body: JSON.stringify({
        found: false
      })
    };

  }

  // ===============================
  // TITOLO
  // ===============================

  const title =
    googleBook?.title ||
    openLibraryBook?.title ||
    "";

  // ===============================
  // AUTORE
  // ===============================

  const googleAuthor =
    googleBook?.authors?.join(", ") || "";

  const openLibraryAuthor =
    openLibraryBook?.author_name?.join(", ") || "";

  const author =
    googleAuthor ||
    openLibraryAuthor ||
    "";

  // ===============================
  // PAGINE
  // ===============================

  const pages =
    googleBook?.pageCount ||
    openLibraryBook?.number_of_pages_median ||
    "";

  // ===============================
  // EDITORE
  // ===============================

  const publisher =
    googleBook?.publisher ||
    openLibraryBook?.publisher?.[0] ||
    "";

  // ===============================
  // GENERE
  // ===============================

  let genre = "";

  if (
    googleBook?.categories &&
    googleBook.categories.length > 0
  ) {

    genre = googleBook.categories[0];

  } else if (
    openLibraryBook?.subject &&
    openLibraryBook.subject.length > 0
  ) {

    genre = openLibraryBook.subject[0];

  }

  // ===============================
  // ANNO
  // ===============================

  const publishedDate =
    googleBook?.publishedDate ||
    openLibraryBook?.first_publish_year ||
    "";

  // ===============================
  // RISULTATO
  // ===============================

  return {

    statusCode: 200,

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({

      found: true,

      book: {
        title: title,
        author: author,
        isbn: isbn,
        pages: pages,
        publisher: publisher,
        genre: genre,
        publishedDate: publishedDate
      }

    })

  };

};
