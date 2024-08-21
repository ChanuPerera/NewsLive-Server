const mongoose = require("mongoose");
const AuthUser = mongoose.model('AuthUser');


const reporterMiddeleware = async (req, res, next) => {

    try {

        const {userId , roleType} = req.authUser;

        const authUser = await AuthUser.findById(userId).populate('reporter');
       
       
        if(authUser && authUser.roleType === 'reporter' && authUser.reporter)
        {
            req.reporter = authUser.reporter;
            next();
        }else{
            res.status(403).json({ error : 'Access denided, Only reporters can create articles'});
        }
        
    } catch (error) {
        console.error('Reporter Middelware Error', error);
        res.status(500).json({ error : 'Internal Server Error'});
    }
}


module.exports = reporterMiddeleware;









