const asyncHandler=(fn)=> //higher order funcion which can take function as input.
    async (req,res,next)=>{
        try {
            await fn(req,res,next)
        } catch (error) {
            res.status(error.code||500).json({
                success:false,
                error:err.message
            })
        }
}
export {asyncHandler}