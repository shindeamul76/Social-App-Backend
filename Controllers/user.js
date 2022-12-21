const User = require('../models/User');
const Post = require('../models/post');
const { sendEmail } = require('../middlewares/sendEmail');
const crypto = require('crypto')

exports.Register = async (req, res) => {

    try {
        
        const {name, email, password} = req.body;

        let user = await User.findOne({email});

        if (user) {
            return res
            .status(400)
            .json({
                success: false,
                massage: 'User already exits',
            })
        }

        user = await User.create({ 
            name , 
            email, 
            password, 
            avatar: {public_id: 'sample_id', 
            url: 'sampleurl'},
        });
        // res.status(201).json({success: true, users})
// Instead of sending above line we will directily login after register
        const token = await user.generateToken();

        const options = {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        }

        res.status(201).cookie("token", token, options).json({
            success: true,
            user,
            token,
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            massage: error.massage,
        })
    }
}


exports.Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({email}).select('+password');

        if (!user) {
            return res.status(400). json({
                success: false,
                massage: "User does not exits"
            });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                massage: "Incorrect Password"
            })
        }

        const token = await user.generateToken();

        const options = {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        }

        res.status(200).cookie("token", token, options).json({
            success: true,
            user,
            token,
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            massage: error.massage,
        })
    }
}

exports.logOut = async (req, res) => {
    try {
        
        res.status(200)
        .cookie("token", null, {expires: new Date(Date.now()), httpOnly: true})
        .json({
            success: true,
            massage: "Logged Out",
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            massage: error.massage,
        })
    }
}


exports.followeUser = async (req, res) => {
    try {
        
         const userToFollow = await User.findById(req.params.id);
         const loggedInUser = await User.findById(req.user.id);

         if (!userToFollow) {
            return res.status(404).json({
                success: false,
                massage: "User not found",
            })
         }

         if(loggedInUser.following.includes(userToFollow._id)){

            const indexfollowing = loggedInUser.following.indexOf(userToFollow._id)
            const indexfollowers = userToFollow.followers.indexOf(loggedInUser._id);

            loggedInUser.following.splice(indexfollowing, 1);
            userToFollow.followers.splice(indexfollowers, 1);

            await loggedInUser.save();
            await userToFollow.save();

            return res.status(200).json({
                success: true,
                massage: "UnFollowing"
             })

         }else {

            loggedInUser.following.push(userToFollow._id);
            userToFollow.followers.push(loggedInUser._id);

            await loggedInUser.save();
            await userToFollow.save();

           return res.status(200).json({
            success: true,
            massage: "Following"
         })
         }

    } catch (error) {
        res.status(500).json({
            success: false,
            massage: error.massage,
        })
    }
}

exports.updatePassword = async  (req, res) => {
    try {
        
        const user = await User.findById(req.user._id).select("+password")

        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                massage: "Please provide old and new password",
            })
        }

        const isMatch = await user.matchPassword(oldPassword);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                massage: "Incorrect old password",
            })
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            massage: "Password is Updated"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            massage: error.massage,
        })
    }
}


exports.updateProfile = async  (req, res) => {
    try {
        
        const user = await User.findById(req.user._id);

        const { name, email } = req.body;

        if (name) {
            user.name = name;
        }

        if (email) {
            user.email = email;
        }

        await user.save();

        res.status(200).json({
            success: true,
            massage: "Profile is Updated"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            massage: error.massage,
        })
    }
}

exports.deleteProfile = async (req, res) => {
    try {
        
        const user = await User.findById(req.user._id);

        const posts = user.posts;
        const followers = user.followers;
        const following = user.following;
        const userId = user._id;

        await user.remove();
//after deleting user logout user
         res.cookie("token", null,  {expires: new Date(Date.now()), httpOnly: true})     
/// deleting all posts of user
        for (let i = 0; i < posts.length; i++) {
            const post = await Post.findById(posts[i]);
            await post.remove();
        }

        //Removing user followers from followers following
        for (let i = 0; i < followers.length; i++) {
            const follower = await User.findById(followers[i]);

            const index = follower.following.indexOf(userId);
            follower.following.splice(index, 1);
            await follower.save();
        }

        //Removing user followers from following's  followers
        for (let i = 0; i < following.length; i++) {
            const follows = await User.findById(following[i]);

            const index = follows.followers.indexOf(userId);
            follows.followers.splice(index, 1);
            await follows.save();
        }

        res.status(200).json({
            success: true,
            massage: "Profile Deleted"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            massage: error.massage,
        })
    }
}

exports.myProfile =async (req, res) => {

    try {
        
        const user = await User.findById(req.user._id).populate('posts');

        res.status(200).json({
            success: true,
            user,
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            massage: error.massage,
        })
    }
}

exports.getUserProfile = async (req, res) => {
    try {
        
        const user = await User.findById(req.params.id).populate('posts');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            massage: error.massage,
        })
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        
        const users = await User.find({});

        res.status(200).json({
            success: true,
            users,
        })

        }  catch (error) {
        res.status(500).json({
            success: false,
            massage: error.massage,
        })
    }
}

exports.forgetPassword = async (req, res) => {
    try {
        
        const user = await User.findOne({email:req.body.email});

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const resetPasswordToken = user.getResetPasswordToken();

        await user.save();

        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetPasswordToken}`;

        const message = `Reset Your Password by clicking on the link below: \n\n ${resetUrl}`;

        try {
            
            await sendEmail({
                email: user.email,
                subject: "Reset Password",
                message,
            });

            res.status(200).json({
                success: true,
                message: `Email sent to ${user.email}`,
            })

        } catch (error) {
            
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save();

            res.status(500).json({
                success: false,
                massage: error.massage,
            })

        }

    }  catch (error) {
        res.status(500).json({
            success: false,
            massage: error.massage,
        })
    }
}

exports.resetPassword = async (req, res) => {
    try {

        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if(!user) {
            return res.status(401).json({
                success: false,
                message: "Token is invalid or has expire",
            })
        }

        user.password = req.body.password;

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        })
        
    } catch (error) {

        res.status(500).json({
            success: false,
            massage: error.massage,
        })
        
    }
}