const express = require("express");
const router = express.Router();

/**
 * @desc Renders Authors home page
 */
router.get("/home", (req, res, next) => {
  // create sql queries
  const draft_query = "SELECT * FROM allArticles WHERE author_id=1 AND article_status='draft'";
  const published_query = "SELECT * FROM allArticles WHERE author_id=1 AND article_status='published'";
  const blog_info_query = "SELECT * FROM blogAuthors WHERE author_id=1";
  // first get all data and then render it
  Promise.all([
                queryWrapper(draft_query),
                queryWrapper(published_query),
                queryWrapper(blog_info_query),
              ])
              .then(([draft_res, pub_res, blog_info]) => {
                res.render("home", {
                  draft_res, 
                  pub_res,
                  blog_info
                });
              })
              .catch(err => {
                next(err);
              })
});

/**
 * @desc Renders Authors edit record page
 */
router.get('/edit/id=:id', function(req , res, next){
  const article_id = req.params.id;
  const article_query = `SELECT * FROM allArticles WHERE article_id = ${article_id}`;
  const blog_info_query = "SELECT * FROM blogAuthors WHERE author_id=1";

  Promise.all([
                queryWrapper(article_query),
                queryWrapper(blog_info_query),
              ])
              .then(([article_info, blog_info]) => {
                res.render("edit", {
                  article_info, 
                  blog_info
                });
              })
              .catch(err => {
                next(err);
              })
});

/**
 * @desc Edit an article in the database
 */
router.post('/edit/:id', (req , res, next) => {
  const article_id = req.params.id;
  const title = req.body.title;
  const subtitle = req.body.subtitle;
  const article_value = req.body.article_value;
  const last_modified = get_time_date();
  const update_query = "UPDATE allArticles SET title=?, subtitle=?, article_value=?, last_modified=? WHERE article_id=?"

  global.db.all(
    update_query,
    [title, subtitle, article_value, last_modified, article_id],
    function (err) {
      if (err) {
        next(err); //send the error on to the error handler
      } else {
        res.redirect("/author/home");
        next();
      }
    }
  );
});

/**
 * @desc Change an article status to 'published' 
 */
router.post("/publish/id=:id", (req, res, next) => {
  global.db.run(
    "UPDATE allArticles SET article_status=?, published=? WHERE article_id=?", 
    ['published', get_time_date(), req.params.id],
    function(err) {
      if(err) {
        next(err);
      } else {
        res.redirect("/author/home");
        next();
      }
    }
  );
});

/**
 * @desc Delete an article from database
 */
router.post("/delete/id=:id", (req, res, next) => {
  const delete_article_query = `DELETE from allArticles WHERE article_id=${req.params.id}`;
  const delete_comments_query = `DELETE from articleComments WHERE article_id=${req.params.id}`
  
  Promise.all([
    queryWrapper(delete_comments_query),
    queryWrapper(delete_article_query),
  ])
  .then(() => {
    res.redirect("/author/home");
  })
  .catch(err => {
    next(err);
  })
});

/**
 * @desc Share article url
 */
router.get("/share/id=:id", (req, res, next) => {
  const query = `SELECT * FROM allArticles WHERE article_id=${req.params.id}`;
  global.db.all(
    query, function (err, result) {
      if (err) {
        next(err); //send the error on to the error handler
      } else {
        res.render("share-url", {article:result});
      }
    });
});



/**
 * @desc Renders settings page
 */
router.get("/settings", (req, res) => {
  const blog_info_query = "SELECT * FROM blogAuthors WHERE author_id=1";
  global.db.all(
    blog_info_query, function (err, result) {
      if (err) {
        next(err); //send the error on to the error handler
      } else {
        res.render("settings", {blog_info:result});
      }
    });
});

/**
 * @desc Settings page update
 */

router.post("/settings", (req, res, next) => {
  const blog_title = req.body.title;
  const blog_subtitle = req.body.subtitle;
  const author_name = req.body.author_name;
  const update_query = "UPDATE blogAuthors SET blog_title=?, blog_subtitle=?, author_name=? WHERE author_id=1";

  global.db.all(update_query, [blog_title, blog_subtitle, author_name], function(err) {
    if(err) {
      next(err);
    } else {
      res.redirect("/author/home");
    }
  })

})


/**
 * @desc Add a new article record to the database for user id = 1
 */
router.post("/create-new-article", (req, res, next) => {
  const title = req.body.title;
  const subtitle = req.body.subtitle;
  const article_value = req.body.article_value;
  const created = get_time_date();
  const last_modified = get_time_date();
  const create_query = "INSERT INTO allArticles ('author_id', 'title', 'subtitle', 'created', 'last_modified', 'article_status', 'article_value', 'likes') VALUES(?, ?, ?, ?, ?, ?, ?, ?)"
  
  global.db.run(
    create_query,
    [1, title, subtitle, created, last_modified, 'draft', article_value, 0],
    function (err) {
      if (err) {
        next(err); //send the error on to the error handler
      } else {
        res.redirect('article-created');
        // res.redirect("/author/home");
        next();
      }
    }
  );
});

/**
 * @desc Renders page with a success message after an article was created 
 */
router.get('/article-created', (req, res) => {
  res.render('article-created');
});


/**
 * @desc Renders create new draft page
 */
router.get("/create-new-article", (req, res) => {
  const blog_info_query = "SELECT * FROM blogAuthors WHERE author_id=1";
  global.db.all(
    blog_info_query, function (err, result) {
      if (err) {
        next(err); //send the error on to the error handler
      } else {
        res.render("create-new-article", {blog_info:result});
      }
    });
});




///////////////////////////////////////////// HELPERS ///////////////////////////////////////////

/**
 * @desc сreate a promise so that async await functions can be used and multiple sql queries can be rendered on one page
 * @returns a promise
 */
const queryWrapper = (statement) => {
  return new Promise((resolve, reject) => {
      global.db.all(statement, function (err, result) {
        if(err)
          return reject(err);
        resolve(result);
      });
  });
};


/**
 * @desc A helper function to generate a current timestamp with date and time
 * @returns current date string
 */

function get_time_date() {
  let today = new Date();
  let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  let dateTime = date+' '+time;
  
  return dateTime;
}


module.exports = router;