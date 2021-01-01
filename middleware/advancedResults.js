const advancedResults = (model, populate) => async (req, res, next) => {
  //now our advanced query is in middleware witches requires the model and the thing we wanna populate
  //initiate query
   let query;

        //copy req.query
        const reqQuery={...req.query}


        //adding fileds that we dont wanna match when reqiusting
        const removeFields=['select','sort','page','limit' ];

        
        //looping throught the fileds and deleting them from reqQuery so he dosent see them as fileds
        removeFields.forEach(param =>{
            delete reqQuery[param];
        })

        

        //create query string
        let queryStr=JSON.stringify(reqQuery)//reason for that to use raplace function

        
        

        //create operators sush as gt gte lte(less the or equel) lt... also adding the $ sign
        queryStr=queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);




        //finding resourse //now we are changing the name from Bootcamp to model in the middleware
        query=model.find(JSON.parse(queryStr))//.populate('courses');//reason we used JSONparse because it wont find anything because the query is a Json object
        //we commented out the .populate because somtimes we are not gonna use it

        if(req.query.select){//now the reason why we use reqQuery is that select was removed from it
            
            
            const fileds=req.query.select.split(',').join(' ');
            //now the reasoning behind this line of code is that in the mongoosedoc...
            //in the mongoose doc it says it must look like this example .select(name dec) as you can see the filed object of ours without
            //without that line of code it will look like this {name: , dec:}
            //turn it into array than to a string
           
            
            query =query.select(fileds);     
        }

        //sort
        if(req.query.sort){
            
            const sortBy=req.query.sort.split(',').join(' ');
        
            
            query =query.sort(sortBy); 

        }
        else{
             query =query.sort('-createdAT'); 
         }


         //pagination
        const page=parseInt(req.query.page, 10) ||1 ;//parseInt changes a string into a number default is 1
       
        const limit=parseInt(req.query.limit, 10) ||3 ;
        
        const startIndex= (page - 1) * limit;
       

        const endIndex=page * limit;
       

        const total =await model.countDocuments(); //a build in function in mongoose that counts how many documents you have
       



        query=query.skip(startIndex).limit(limit);

        //if populate is used 


          if (populate) {
          query = query.populate(populate);
          }


        //pagination results
        const pagination ={};


        if(endIndex < total){
            pagination.next={
                page:page+1,
                limit
            }
        }

        if(startIndex >0){
              pagination.prev={
                page:page-1,
                limit
            }
        }
        //excuting
        const results = await query;
        //insted of bootcamps we wrote results its dosent really matter whats the const is thou results make alot of sence
        res.advancedResults={success:true ,count:results.length ,pagination:pagination ,data : results}

        next();
      }


module.exports = advancedResults;
