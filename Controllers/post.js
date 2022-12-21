const Post = require('../models/post')
const User = require('../models/User');

exports.createPost = async (req, res) => {

    try {
        const newPostData = {
            caption: req.body.caption,
            image:{
                public_id: 'req.body.public_id',
                url: req.body.url,
            },
            owner: req.user._id
        }

        const post = await Post.create(newPostData);

        const user = await User.findById(req.user._id);

        user.posts.push(post._id)

        await user.save();
        res.status(201).json({
            success: true,
            post,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            massage: error.massage,
        })
    }
}


exports.deletePost = async  (req, res) => {

    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                massage: "Post not found"
            })
        }

        if (post.owner.toString() !== req.user._id.toString()) {
            return res.status(404).json({
                success: false,
                massage: "Unauthorized"
            })
        }

        await post.remove();
        const user = await User.findById(req.user._id);
        const index = user.posts.indexOf(req.params._id);
        user.posts.splice(index, 1);
        await user.save();

        res.status(200).json({
            success: true,
            massage: "Post deleted"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            massage: error.massage,
        })
    }
}


exports.likeAndUnlikePost = async (req, res) => {
    try {
        
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                massage: "Page not found"
            })
        }

        if(post.likes.includes(req.user._id)){
            const index = post.likes.indexOf(req.user._id);
            post.likes.splice(index, 1);
            await post.save();
            return res.status(200).json({
                success: true,
                massage: "Post Unliked"
            })
        }else {
            post.likes.push(req.user._id)
            await post.save();
            return res.status(200).json({
                success: true,
                massage: "Post liked"
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            massage: error.massage,
        })
    }
}


exports.getPostOfFollowing = async (req, res) => {

    try {
        
        const user = await User.findById(req.user._id);

        const posts = await Post.find({
            owner: {
                $in: user.following,
            }
        });

        res.status(200).json({
            success: true,
            posts,
        })

    } catch (error) {
        res.status(500)
        .json({
            success: false,
            massage: error.massage,
        })
    }
}



exports.updateCaption = async  (req, res) => {
    try {
        
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                massage: "Post not found"
            })
        }

        if (post.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                massage: "Unauthorized"
            })
        }

        post.caption = req.body.caption;
        await post.save();

        res.status(200).json({
            success: true,
            massage: "Caption is Updated"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            massage: error.massage,
        })
    }
}

exports.commentOnPost = async (req, res) => {
    try {
        
        const post = await Post.findById(req.params.id);

        if(!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }

        let commentIndex = -1;
        // Checking if comment is exits or not
        post.comments.forEach((item, index) => {
            if(item.user.toString() === req.user._id.toString()) {
                commentIndex = index;
            }
        })

     if(commentIndex !== -1){

        post.comments[commentIndex].comment = req.body.comment;

        await post.save();
        return res.status(200).json({
            success: true,
            message: "Comment Updated"
        })

     }else{
        post.comments.push({
            user: req.user._id,
            comment: req.body.comment,
        })

        await post.save();
        return res.status(200).json({
            success: true,
            message: "Comment added"
        })
     }

    } catch (error) {
        res.status(500).json({
            success: false,
            massage: error.massage,
        })
    }
}


exports.deleteComment = async (req, res) => {
    try {
        
        const post = await Post.findById(req.params.id);

        if(!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }

        //  Checking if owner wants to delete
        if (post.owner.toString() === req.user._id.toString()) {

            if (req.body.commentId == undefined) {
                return res.status(400).json({
                    success: false,
                    messsage: "Comment Id is required"
                })
            }

            post.comments.forEach((item, index) => {
                if(item._id.toString() === req.body.commentId.toString()) {
                   return post.comments.splice(index, 1);
                }
            })

            await post.save();
            return res.status(200).json({
                success: true,
                message: "selected comment has deleted"
            })


        }else {

            post.comments.forEach((item, index) => {
                if(item.user.toString() === req.user._id.toString()) {
                   return post.comments.splice(index, 1);
                }
            })

            await post.save();
            return res.status(200).json({
                success: true,
                message: " your comment has deleted"
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            massage: error.massage,
        })
    }
}