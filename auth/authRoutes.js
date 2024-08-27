const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Reader = mongoose.model("Reader");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authMiddelware = require('../middleware/authMiddeleware');
const reporterMiddeleware = require('../middleware/reporterMiddleware');
const AuthUser = mongoose.model("AuthUser");
const Reporter = mongoose.model("Reporter");
const Article = mongoose.model("Article");
const Draft = mongoose.model("Draft");

const multer = require("multer");
const path = require("path");

/////////////////////
require('dotenv').config();
////////////////////



// router.post('/add-new-reader', async (req, res) => {
//     try {

//         console.log('Data set from Client -', req.body);
//         const { firstName, lastName, email, userID, password} = req.body;
//         const reader = new Reader({
//             firstName, 
//             lastName, 
//             email, 
//             userID, 
//             password,
//         });
//         await reader.save();
//         res.send({message: "Reader registered Successfully"});

//     } catch (error) {
//         console.log('Database error', error);
//         return res.status(422).send({error: error.message});
//     }

// });







router.post('/add-new-reader', async (req, res) => {
    try {

        console.log('Data set from Client -', req.body);
        const { firstName, lastName, email, userID, password } = req.body;

        //// check if the userID or email already exists
        const existsReader = await Reader.findOne({ userID }) || await Reader.findOne({ email });
        if (existsReader) {
            return res.status(422).send({ error: 'UserID or email is already exists' , success: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const reader = new Reader({
            firstName,
            lastName,
            email,
            userID,
            password: hashedPassword,
        });
        await reader.save();
        const authUser = new AuthUser({
            userID: reader.userID,
            roleType: "reader",
            reader: reader._id
        })
        await authUser.save();

        res.send({ message: "Reader registered Successfully", success: true});

    } catch (error) {
        console.log('Database error', error);
        return res.status(422).send({ error: error.message , success: false });
    }

});




/////////// add new reporter ////////////////

router.post('/add-new-reporter', async (req, res) => {
    try {

        console.log('Data sent by Client side -', req.body);
        const { firstName, lastName, email, userID, password, city, country, contactNumber } = req.body;
        const existingReporter = await Reporter.findOne({ userID }) || await Reporter.findOne({ email });
        if (existingReporter) {
            return res.status(422).send({ error: "userID or email already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const reporter = new Reporter({
            firstName,
            lastName,
            email,
            userID,
            password: hashedPassword,
            city,
            country,
            contactNumber
        });
        await reporter.save();
        const authUser = new AuthUser({
            userID: reporter.userID,
            roleType: "reporter",
            reporter: reporter._id
        })
        await authUser.save();
        res.send({ message: "Reporter registered Successfully" });

    } catch (error) {
        console.log('Database error', error);
    }
});




///////////////// user login /////////////////////
router.post('/user-login', async (req, res) => {

    try {
        const { userID, password } = req.body

        const authUser = await AuthUser.findOne({ userID });

        if (!authUser) {
            return res.status(401).json({ error: "Invalid user" })
        }

        let user;
        if (authUser.roleType === "reader") {
            user = await Reader.findById(authUser.reader);
        } else if (authUser.roleType === "reporter") {
            user = await Reporter.findById(authUser.reporter);
        }

        //////////if user not found
        if (!user) {
            return res.status(401).json({ error: "Invalid user" })
        }
        /////////// if user found

        const isMatch = await bcrypt.compare(password, user.password);

        //////////// if not matching password
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid password" })
        }

        //////////// if password correct
        ///////////////////////// then generate JWT

        const token = jwt.sign({ userId: authUser._id, roleType: authUser.roleType }, process.env.JWT_SECRET, { expiresIn: '10m' });
        const roleType = authUser.roleType;

        /////////// Return data

        res.json({ token, roleType });
        console.log(`Logging as ${authUser.roleType}`);

    } catch (error) {
        console.log('Database error', error);
    }
});




//////// create a new article
// router.post('/create-new-article', authMiddelware, reporterMiddeleware , async (req, res) => {
//     const {articleType,newsHeading,newsDescription , newsDescriptionLong ,city , country , coverImage} = req.body;
//     try {
//         const newArticle = new Article({
//             author: req.reporter._id,
//             articleType,
//             newsHeading,
//             newsDescription, 
//             newsDescriptionLong,
//             city, 
//             country, 
//             coverImage

//         });
//         ////////////// save the article
//         const savedArticle = await newArticle.save();
//         ///////////////////// update the reporter article list
//         req.reporter.articles.push(savedArticle._id)
//         await req.reporter.save();
//         res.status(201).json(savedArticle);
//     } catch (error) {
//         console.error('Error creating article', error);
//         res.status(500).json({ error : 'Internal Server Error'}); 
//     }

// });






// //////// create a new article v2
// router.post('/create-new-article', authMiddelware, reporterMiddeleware , async (req, res) => {
//     const {articleType,newsHeading,newsDescription , newsDescriptionLong ,city , country , coverImage , publicationType} = req.body;

//     /////// Validate Publication TYpe
//     if(![0, 1, 2].includes(publicationType)){
//         return res.status(400).json({error: 'Inavlid publication Type'});
//     }

//     try {
//         const newArticle = new Article({
//             author: req.reporter._id,
//             articleType,
//             newsHeading,
//             newsDescription, 
//             newsDescriptionLong,
//             city, 
//             country, 
//             coverImage,
//             publicationType

//         });
//         ////////////// save the article
//         const savedArticle = await newArticle.save();
//         ///////////////////// update the reporter article list
//         req.reporter.articles.push(savedArticle._id)
//         await req.reporter.save();
//         res.status(201).json(savedArticle);
//     } catch (error) {
//         console.error('Error creating article', error);
//         res.status(500).json({ error : 'Internal Server Error'}); 
//     }

// });





/////// setup multer for storage
const storage = multer.diskStorage({
    destination : (req,file, cb) =>{
        cb(null, "uploads/");
    },
    filename: (req, file, cb) =>{
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage : storage });


//////// create a new article v3
router.post('/create-new-article', authMiddelware, reporterMiddeleware, upload.single('coverImage'), async (req, res) => {
    const { articleType, newsHeading, newsDescription, newsDescriptionLong, city, country } = req.body;
    const publicationType = parseInt(req.body.publicationType, 10);
    const coverImage = req.file ? req.file.path : null;

    if (![0, 1, 2].includes(publicationType)) {
        return res.status(400).json({ error: 'Invalid publication Type' });
    }

    if (!coverImage) {
        return res.status(400).json({ error: 'Cover Image is required' });
    }

    try {
        const newArticle = new Article({
            author: req.reporter._id,
            articleType,
            newsHeading,
            newsDescription,
            newsDescriptionLong,
            city,
            country,
            coverImage,
            publicationType
        });

        const savedArticle = await newArticle.save();
        req.reporter.articles.push(savedArticle._id);
        await req.reporter.save();

        if (publicationType === 2) {
            const newDraft = new Draft({
                author: req.reporter._id,
                articleType,
                newsHeading,
                newsDescription,
                newsDescriptionLong,
                city,
                country,
                coverImage,
                publicationType
            });

            const savedDraft = await newDraft.save();
            req.reporter.drafts.push(savedDraft._id);
            await req.reporter.save();

            return res.status(201).json({ message: 'Draft Saved' });
        }

        res.status(201).json({ message: 'Article Saved', success: true });
    } catch (error) {
        console.error('Error creating article', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




router.get('/fetch-articles' , async(req , res) => {
    try {
        
        //////////////// filter latest artciles by date
        const latestArticles = await Article.find().sort({ publishedDate: -1}).limit(3);

        /////////////////// fetch all articles 
        const allArticles = await Article.find().sort({publishedDate: -1});
        res.status(200).json({latestArticles , allArticles });

    } catch (error) {
        console.error('Error fetching articles' , error);
        res.status(500).json({error: 'Internal server Error'});
    }
})





///////////////////// Delete article 
router.delete('/delete-article/:id', authMiddelware, reporterMiddeleware, async (req, res) => {
    const articleId = req.params.id;
    try {
        const article = await Article.findById(articleId);
        ////////// if article not found
        if (!articleId) {
            return res.status(404).json({ error: 'Article not found' });
        }
        /// check if the requesting reporter is the author 
        if (article.author.toString() !== req.reporter._id.toString()) {
            return res.status(403).json({ error: 'You are not authorized to delete this article' });
        }
        ///// Delete Article
        await Article.findByIdAndDelete(articleId);
        ///// Delete Draft
        await Draft.findByIdAndDelete(articleId);
        ///// Remove the Article/Draft IDs from the author
        await Reporter.findByIdAndUpdate(req.reporter._id, {
            $pull: { articles: articleId, drafts: articleId }
        })
        res.status(201).json({ message: 'Article deleted' });

    } catch (error) {
        console.error('Error deleting article', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});












/////////////// Route to Update articles and Drafts
// router.put('/update-article/:id', authMiddelware, reporterMiddeleware, async (req, res) => {
//     const articleId = req.params.id;
//     const { articleType, newsHeading, newsDescription, newsDescriptionLong, city, country, coverImage, publicationType } = req.body;

//     /////// Validate Publication TYpe
//     if (![0, 1, 2].includes(publicationType)) {
//         return res.status(400).json({ error: 'Inavlid publication Type' });
//     }


//     try {

//         const article = await Article.findById(articleId);

//         if (!article) {
//             return res.status(404).json({ error: "Article not found" });
//         }
        

//         /// check if the requesting reporter is the author 
//         if (article.author.toString() !== req.reporter._id.toString()) {
//             return res.status(403).json({ error: 'You are not authorized to delete this article' });
//         }

//         ///////////// Update article fields
//         article.articleType = articleType || article.articleType;
//         article.newsHeading = newsHeading || article.newsHeading;
//         article.newsDescription = newsDescription || article.newsDescription;
//         article.newsDescriptionLong = newsDescriptionLong || article.newsDescriptionLong;
//         article.city = city || article.city;
//         article.country = country || article.country;
//         article.coverImage = coverImage || article.coverImage;
//         article.publicationType = publicationType;

//         /////////////// Save the updated article
//         const updatedArticle = await article.save();

//         if (publicationType === 2) {
//             let draft = await Draft.findOne({ author: req.reporter._id, _id: articleId });

//             if (!draft) {
//                 draft = new Draft({
//                     _id: articleId,
//                     author: req.reporter._id,
//                     articleType,
//                     newsHeading,
//                     newsDescription,
//                     newsDescriptionLong,
//                     city,
//                     country,
//                     coverImage,
//                     publicationType
//                 });
//             } else {
//                 ///////////// Update Draft fields
//                 draft.articleType = articleType || draft.articleType;
//                 draft.newsHeading = newsHeading || draft.newsHeading;
//                 draft.newsDescription = newsDescription || draft.newsDescription;
//                 draft.newsDescriptionLong = newsDescriptionLong || draft.newsDescriptionLong;
//                 draft.city = city || draft.city;
//                 draft.country = country || draft.country;
//                 draft.coverImage = coverImage || draft.coverImage;
//                 draft.publicationType = publicationType;
//             }

//             await draft.save();
//         }

//         else{
//             await Draft.findByIdAndDelete({author: req.reporter._id, _id: articleId})
//         }

//         res.status(200).json(updatedArticle)

//     } catch (error) {
//         console.error('Error updating the article', error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// })






router.put('/update-article/:id', authMiddelware, reporterMiddeleware, async (req, res) => {
    const articleId = req.params.id;
    const { articleType, newsHeading, newsDescription, newsDescriptionLong, city, country, coverImage, publicationType } = req.body;

    // Validate Publication Type
    if (![0, 1, 2].includes(publicationType)) {
        return res.status(400).json({ error: 'Invalid publication type' });
    }

    try {
        let article = await Article.findById(articleId);
        let draft = null;
        let isDraft = false;

        if (!article) {
            draft = await Draft.findById(articleId);
            if (!draft) {
                return res.status(404).json({ error: "Article or Draft not found" });
            }
            isDraft = true;
            article = draft;
        }

        // Check if the requesting reporter is the author
        if (article.author.toString() !== req.reporter._id.toString()) {
            return res.status(403).json({ error: 'You are not authorized to update this article' });
        }

        // Update article/draft fields
        article.articleType = articleType || article.articleType;
        article.newsHeading = newsHeading || article.newsHeading;
        article.newsDescription = newsDescription || article.newsDescription;
        article.newsDescriptionLong = newsDescriptionLong || article.newsDescriptionLong;
        article.city = city || article.city;
        article.country = country || article.country;
        article.coverImage = coverImage || article.coverImage;
        article.publicationType = publicationType;

        // Save the updated article or draft
        const updatedArticle = await article.save();

        if (isDraft) {
            if (publicationType === 0 || publicationType === 1) {
                // Delete the draft
                await Draft.findByIdAndDelete(articleId);
                // Remove draft ID from reporter's drafts array
                req.reporter.drafts.pull(articleId);

                // Create new article
                const newArticle = new Article({
                    _id: articleId, // Preserve the same ID
                    author: req.reporter._id,
                    articleType,
                    newsHeading,
                    newsDescription,
                    newsDescriptionLong,
                    city,
                    country,
                    coverImage,
                    publicationType
                });

                const savedArticle = await newArticle.save();
                // Add article ID to reporter's articles array
                req.reporter.articles.push(savedArticle._id);
                await req.reporter.save();

                return res.status(200).json(savedArticle);
            } else {
                // Update draft
                await draft.save();
                return res.status(200).json(draft);
            }
        } else {
            // If updating an article, handle draft deletion if necessary
            if (publicationType === 2) {
                const existingDraft = await Draft.findById(articleId);
                if (!existingDraft) {
                    const newDraft = new Draft({
                        _id: articleId,
                        author: req.reporter._id,
                        articleType,
                        newsHeading,
                        newsDescription,
                        newsDescriptionLong,
                        city,
                        country,
                        coverImage,
                        publicationType
                    });
                    await newDraft.save();
                    req.reporter.drafts.push(newDraft._id);
                    await req.reporter.save();
                }
            } else {
                await Draft.findByIdAndDelete(articleId);
                req.reporter.drafts.pull(articleId);
                await req.reporter.save();
            }
            return res.status(200).json(updatedArticle);
        }
    } catch (error) {
        console.error('Error updating the article', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});





///////////////// Get user Details
router.get('/user-details', authMiddelware, async (req, res) => {
    try {
        const { userId, roleType } = req.authUser; // Ensure authMiddleware sets these correctly

        const authUser = await AuthUser.findById(userId);
        if (!authUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        let userDetails;
        if (roleType === 'reader') {
            userDetails = await Reader.findById(authUser.reader);
        } else if (roleType === 'reporter') {
            userDetails = await Reporter.findById(authUser.reporter); 
        } else {
            return res.status(404).json({ error: 'Invalid role type' });
        }

        if (!userDetails) {
            return res.status(404).json({ error: 'User Details not found' });
        }

        res.json(userDetails);

    } catch (error) {
        console.error("Error fetching user details", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});








module.exports = router;
