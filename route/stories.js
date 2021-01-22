const express = require('express')
const router = express.Router()
const {ensureAuth } = require('../middleware/auth');
const { populate } = require('../models/Story');

const Story = require('../models/Story');


// show add page
// get /stories/add
router.get('/add',ensureAuth,  (req,res)=>{
    res.render('stories/add')
})


// process add page
// post  /stories/add
router.post('/', ensureAuth, async (req, res) => {
    try {
      req.body.user = req.user.id
      await Story.create(req.body)
      res.redirect('/dashboard')
    } catch (err) {
      console.error(err)
      res.render('error/505')
    }
  })
  
// show all page stories
// get /stories/
router.get('/',ensureAuth, async (req,res)=>{
  try {
    const stories = await Story.find({status:'public'})
    .populate('user')
    .sort({createdAt: 'desc'})
    .lean()
res.render('stories/index',{stories,})
  } catch (err) {
    console.error(err);
    res.render('error/505')
  }
})

// update stories/show edit page
// get /stories/edit/:id
router.get('/edit/:id',ensureAuth, async (req,res)=>{

  try {
    const story = await Story.findOne({
      _id: req.params.id
    }).lean()
   
    if(!story){
      return res.render('error/404')
    }
   
   if(story.user != req.user.id){
     res.render('/stories')
   }else{
     res.render('stories/edit',{story})
   }
  } catch (err) {
    console.error(err);
    return res.render('error/505')
  }
 
})

// show single page per ID
// get /stories/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).populate('user').lean()

    if (!story) {
      return res.render('error/404')
    }

    if (story.user._id != req.user.id && story.status == 'private') {
      res.render('error/404')
    } else {
      res.render('stories/show', {
        story,
      })
    }
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})




// show update story
// put /stories/add
router.put('/:id',ensureAuth, async (req,res)=>{
try {
  let story = await Story.findById(req.params.id).lean()
  if(!story){
    return req.render('error/404');
  }
  
  if(story.user != req.user.id){
    res.redirect('/stories')
  }else{
    story = await Story.findByIdAndUpdate({_id: req.params.id}, req.body, {
      new: true,
      runValidators: true,
    })
  
    res.redirect('/dashboard')
  }
} catch (err) {
  console.error(err);
    return res.render('error/505')
}

})


// show delete story id
// DELETE  /stories/:id
router.delete('/:id',ensureAuth, async (req,res)=>{
  try {
    await Story.remove({_id: req.params.id})
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    return res.render('error/505')
    
  }
})



// show USER Story
// get /stories/user/:userId
router.get('/user/:userId',ensureAuth, async (req,res)=>{
  try {
      const stories = await Story.find({
        user:req.params.userId,
        status: 'public'
      })
      .populate('user')
      .lean()

      res.render('stories/index',{stories})

  } catch (err) {
    console.error(err);
    return res.render('error/505')
  }
})



module.exports = router;