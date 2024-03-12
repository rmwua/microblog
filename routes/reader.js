const express = require("express");
const router = express.Router();

/**
 * @desc Renders Readers home page
 */
router.get('/home', function(req , res, next){
    const article_query = `SELECT * FROM allArticles WHERE article_status='published'`;
    const blog_info_query = "SELECT * FROM blogAuthors WHERE author_id=1";
  
    Promise.all([
        queryWrapper(article_query),
        queryWrapper(blog_info_query),
        ])
        .then(([articles, blog_info]) => {
            res.render("reader-home", {
            articles, 
            blog_info
            });
        })
        .catch(err => {
            next(err);
        })
  });


/**
 * @desc Renders article page
 */
router.get('/article=:id', function(req , res, next) {
    const article_id = req.params.id;
    const article_query = `SELECT * FROM allArticles WHERE article_id = ${article_id} and article_status='published'` ;
    const blog_info_query = `SELECT * FROM blogAuthors WHERE author_id=1`;
    const comments_query = `SELECT * from articleComments WHERE article_id = ${article_id}`

    Promise.all([
        queryWrapper(article_query),
        queryWrapper(blog_info_query),
        queryWrapper(comments_query),
    ])
    .then(([article, blog_info, comments]) => {
        res.render("article",  {
            article,
            blog_info,
            comments
        })
    })
    .catch(err => {
        next(err);
    })
});

/**
 * @desc increment likes in article
 */
router.post("/like/article-id=:id", (req, res, next) => {
    global.db.run(
      `UPDATE allArticles SET likes=likes+1 WHERE article_id=${req.params.id}`,
      function(err) {
        if(err) {
            next(err);
        } else {
            res.redirect(`/reader/article=${req.params.id}`)
            next();
        }
      }
    );
  });

/**
 * @desc post comment in article
 */
router.post("/post-comment/article-id=:id", (req, res, next) => {
    const comment_value = req.body.comment_value;
    const published = get_time_date();
    const article_id = req.params.id;
    const comment_query = `INSERT INTO articleComments ('comment_value', 'article_id', 'published') VALUES(?,?,?)`

    global.db.run(
      comment_query,
      [comment_value, article_id, published],
      function(err) {
        if(err) {
            next(err);
        } else {
            res.redirect(`/reader/article=${req.params.id}`)
            next();
        }
      }
    );
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
