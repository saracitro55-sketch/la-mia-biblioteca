exports.handler = async function(event) {

  const isbn = (event.queryStringParameters?.isbn || "")
    .replace(/[-\s]/g, "")
    .trim();

  if (!isbn) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        found: false,
        error: "ISBN mancante"
      })
    };
  }

  // ===============================
  // 1. OPEN LIBRARY - ISBN DIRETTO
  // ===============================

  try {

    const url =
      "https://openlibrary.org/isbn/" +
      encodeURIComponent(isbn) +
      ".json";

    const response = await fetch(url);

    if (response.ok) {

      const data = await response.json();

      const title =
        data.title || "";

      let author = "";

      if (
        data.authors &&
        data.authors.length > 0
      ) {

        const authors = [];

        for (const item of data.authors) {

          if (item.name) {
            authors.push(item.name);
          }

        }

        author = authors.join(", ");
      }

      const publisher =
        data.publishers &&
        data.publishers.length > 0
          ? (
              data.publishers[0].name ||
              ""
            )
          : "";

      const pages =
        data.number_of_pages ||
        "";

      const publishedDate =
        data.publish_date ||
        "";

      let genre = "";

      if (
        data.subjects &&
        data.subjects.length > 0
      ) {

        genre =
          data.subjects[0].name ||
          "";

      }

      if (title || author) {

        return {

          statusCode: 200,

          headers: {
            "Content-Type":
              "application/json"
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

              publishedDate:
                publishedDate

            }

          })

        };

      }

    }

  } catch (error) {

    console.log(
      "Open Library ISBN:",
      error
    );

  }


  // ===============================
  // 2. GOOGLE BOOKS
  // ===============================

  try {

    const googleUrl =
      "https://www.googleapis.com/books/v1/volumes?q=isbn:" +
      encodeURIComponent(isbn) +
      "&maxResults=10&country=IT";

    const response =
      await fetch(googleUrl);

    if (response.ok) {

      const data =
        await response.json();

      if (
        data.items &&
        data.items.length > 0
      ) {

        const book =
          data.items[0].volumeInfo;

        return {

          statusCode: 200,

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            found: true,

            book: {

              title:
                book.title || "",

              author:
                book.authors
                  ? book.authors.join(", ")
                  : "",

              isbn: isbn,

              pages:
                book.pageCount || "",

              publisher:
                book.publisher || "",

              genre:
                book.categories &&
                book.categories.length > 0
                  ? book.categories[0]
                  : "",

              publishedDate:
                book.publishedDate || ""

            }

          })

        };

      }

    }

  } catch (error) {

    console.log(
      "Google Books:",
      error
    );

  }


  // ===============================
  // 3. OPEN LIBRARY SEARCH
  // ===============================

  try {

    const searchUrl =
      "https://openlibrary.org/search.json?isbn=" +
      encodeURIComponent(isbn) +
      "&limit=10";

    const response =
      await fetch(searchUrl);

    if (response.ok) {

      const data =
        await response.json();

      if (
        data.docs &&
        data.docs.length > 0
      ) {

        const book =
          data.docs[0];

        return {

          statusCode: 200,

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            found: true,

            book: {

              title:
                book.title || "",

              author:
                book.author_name
                  ? book.author_name.join(", ")
                  : "",

              isbn: isbn,

              pages:
                book.number_of_pages_median ||
                "",

              publisher:
                book.publisher &&
                book.publisher.length > 0
                  ? book.publisher[0]
                  : "",

              genre:
                book.subject &&
                book.subject.length > 0
                  ? book.subject[0]
                  : "",

              publishedDate:
                book.first_publish_year ||
                ""

            }

          })

        };

      }

    }

  } catch (error) {

    console.log(
      "Open Library Search:",
      error
    );

  }


  // ===============================
  // NESSUN RISULTATO
  // ===============================

  return {

    statusCode: 404,

    headers: {
      "Content-Type":
        "application/json"
    },

    body: JSON.stringify({

      found: false

    })

  };

};
