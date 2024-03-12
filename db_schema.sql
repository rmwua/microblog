
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;



-- Create table with authors information
CREATE TABLE IF NOT EXISTS blogAuthors (
    author_id INTEGER PRIMARY KEY AUTOINCREMENT,
    blog_title TEXT NOT NULL,
    blog_subtitle TEXT NOT NULL,
    author_name TEXT NOT NULL
);


-- Create table with al articles
CREATE TABLE IF NOT EXISTS allArticles (
    article_id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INT NOT NULL, --the user that the article belongs to
    title TEXT NOT NULL,
    subtitle TEXT,
    created TEXT ,
    published TEXT,
    last_modified TEXT,
    article_status TEXT,
    article_value TEXT,
    likes INT,
    FOREIGN KEY (author_id) REFERENCES blogAuthors(author_id)
);

CREATE TABLE IF NOT EXISTS articleComments (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    comment_value TEXT NOT NULL,
    article_id INT NOT NULL,
    published TEXT,
    FOREIGN KEY(article_id) REFERENCES allArticles(article_id)
);

--insert default data (if necessary here)

INSERT INTO blogAuthors ("author_name", "blog_title", "blog_subtitle") VALUES ("Moscato The Cat", "Daily Meows", "meow meow");


COMMIT;

