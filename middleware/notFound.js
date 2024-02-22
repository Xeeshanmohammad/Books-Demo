const notFound = function(req,res){
    return res.status(500).json({message:"Route Does Not Exist"})
 }
 
 module.exports = notFound