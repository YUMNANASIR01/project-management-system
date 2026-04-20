const asyncHandler = (fn) =>{
//  closure function 
    return function (req,res,next) {
        Promise.resolve(fn(req,res,next)).catch(next)
    }
}

export {asyncHandler}