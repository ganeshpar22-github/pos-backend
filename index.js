const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors()); 


const db = mysql.createConnection({
    user : "root",
    password : "root",
    host : "localhost",
    database : "demo"
});


//to register customers
app.post('/register',(req,res)=>{
    const name = req.body.name;
    const username = req.body.username;
    const password = req.body.password;
    

    db.query("INSERT INTO customer (customer_name,customer_username,customer_password) VALUES (?,?,?)",
    [name,username,password],
    (err,result)=>{
        console.log(err);
    }
    )
})


//to login customer
app.post("/login",(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    console.log(username);
    console.log(password);

    db.query("SELECT customer_id,customer_username,customer_password FROM customer WHERE customer_username = ? AND customer_password = ?",
    [username,password],
    (err,result)=>{

        if(err){
        res.send({err : err})
        }
        
        if(result.length > 0){
            console.log(result)
            res.send(result);
        }
        else{
            res.send({message : "Incorrect UserName or Password"})
        }
    }
    )
})


//admin login
app.post("/admin",(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    

    db.query("SELECT admin_name , admin_password FROM admin WHERE admin_name = ? AND admin_password = ?",
    [username,password],
    (err,result)=>{

        if(err){
        res.send({err : err})
        }
        
        if(result.length > 0){
            res.send(result);
        }
        else{
            res.send({message : "Incorrect UserName or Password"})
        }
    }
    )
})


//add items
app.post('/additems',(req,res)=>{
    //creating variables and putting them in database
    const itemname = req.body.itemname
    const itemprice = req.body.itemprice
    

    db.query('INSERT INTO item (item_name,item_uprice) VALUES (?,?)',
    [itemname,itemprice], (err,result) =>{
        if(err) throw err
        else{
            res.send("Items inserted");
        }
    }
    );
});


//to get items in item list
app.get('/get', ( req , res)=>{
    db.query("SELECT item_id,item_name FROM item",(err,result)=>{
        if(err) throw err;
        else{
            res.send(result);
        }
    })
})

//to delete items from item list
app.delete('/delete/:item_id',(req,res)=>{
    const item_id = req.params.item_id;
    db.query("DELETE FROM item WHERE item_id = ?",[item_id],
    (err,result)=>{
        if(err) throw err;
        else{
            res.send(result);
        }
    })
})


//order table view for customer
app.get('/loadorder/:customer_id', ( req , res)=>{
    const customer_id = req.params.customer_id;
    console.log(req.params)
    db.query("SELECT order_id,status,order_date FROM order_details WHERE customer_id = ? ;",[customer_id],
    (err,result)=>{
        if(err) throw err;
        else{
            console.log(result)
            res.send(result);
        }
    })
})



//to get items for dropdown
app.get('/getdropdown', ( req , res)=>{
    db.query("SELECT item_name FROM item",(err,result)=>{
        if(err) throw err;
        else{
            res.send(result);
        }
    })
})


//to place order
app.post('/addorder',(req,res)=>{
    //creating variables and putting them in database

    const quantity = req.body.quantity;
    const location = req.body.location;
    const description = req.body.description;
    const order_date = req.body.order_date;
    const itemname=req.body.item_name;
    const customer_id=req.body.customer_id;
    console.log(itemname)
    let item_id=0;
    db.query("select item_id from item where item_name= ? ",[itemname],
    (err,result)=>{
        if(err){
            console.log("didn't got item id")
        }else{
            console.log(result)
            console.log(result[0].item_id)
            item_id=result[0].item_id;

            db.query('INSERT INTO order_details (quantity,location,description,order_date,customer_id,item_id) VALUES (?,?,?,?,?,?)',
            [quantity,location,description,order_date,customer_id,item_id], (err,result) =>{
                if(err) {
                    console.log("error occured while inserting item")
                }
                else{
                    res.send("Items inserted");
                }
            }
            );

        }
    })

   

});


//to update order
app.put('/updateorder/:order_id',(req,res)=>{
    const order_id = req.params.order_id;
    
    const location = req.body.location;
    const quantity = req.body.quantity;
    const description = req.body.description;
    const order_date = req.body.order_date;
    const itemname=req.body.item_name;
    
    
    console.log(itemname)
    
    db.query("UPDATE order_details SET quantity = ? , location = ?, description = ? , order_date = ? WHERE order_id = ?",
    [quantity,location,description,order_date,order_id],
    (err,result)=>{
        if(err) throw err;
        else{
            console.log(result);
            res.send(result);
        }
    });
})


//to view order 
app.get('/vieworder/:order_id', ( req , res)=>{
    const order_id = req.params.order_id;
    console.log(req.params)
    db.query("SELECT item.item_name,order_details.quantity,order_details.location,order_details.description,order_details.status FROM order_details INNER JOIN item on item.item_id = order_details.item_id WHERE order_id = ?;",[order_id],
    (err,result)=>{
        if(err) throw err;
        else{
            console.log(result);
            res.send(result);
        }
    })
})


//to get customer order details to admin 
app.get('/getcustomer', ( req , res)=>{
    db.query("Select customer_name,order_details.order_id,item_id,status from customer INNER JOIN order_details on customer.customer_id=order_details.customer_id;",(err,result)=>{
        if(err) throw err;
        else{
            res.send(result);
        }
    })
})


//to delete order from admin table
app.delete('/deleteorder/:order_id',(req,res)=>{
    const order_id = req.params.order_id;
    db.query("DELETE FROM order_details WHERE order_id = ?",[order_id],
    (err,result)=>{
        if(err) throw err;
        else{
            res.send(result);
        }
    })
})


//admin order view
app.get('/adminhome/vieworderbyadmin/:order_id', ( req , res)=>{
    const order_id = req.params.order_id;
    db.query("SELECT location,quantity,description,status,item_name FROM order_details INNER JOIN item ON order_details.item_id = item.item_id WHERE order_details.order_id = ? ;",
    [order_id],
    (err,result)=>{
        if(err) throw err;
        else{
            console.log(result)
            res.send(result);
        }
    })
})


//order summary
app.get('/adminhome/ordersummary/:order_id', ( req , res)=>{
    const order_id = req.params.order_id;
    db.query("SELECT location,quantity,description,status,updated_status,total_price,discount,unit_price,item_name FROM order_details INNER JOIN transaction ON order_details.order_id=transaction.order_id INNER JOIN item ON order_details.item_id = item.item_id WHERE order_details.order_id = ? ;",
    [order_id],
    (err,result)=>{
        if(err) throw err;
        else{
            console.log(result)
            res.send(result);
        }
    })
})

 
//for approval
app.post('/approveorder/:order_id',(req,res)=>{
    
    const order_id = req.params.order_id;
    const primary_sale = req.body.primary_sale;
    const secondary_sale = req.body.secondary_sale;
    const unit_price = req.body.unit_price;
    const discount = req.body.discount;
    const total_price = req.body.total_price;
    const updated_status = req.body.updated_status;
    
    console.log(order_id);
    console.log(primary_sale);
    console.log(secondary_sale);
    console.log(unit_price);
    console.log(discount);
    console.log(total_price);
    console.log(updated_status);
    

    

    db.query('INSERT INTO transaction (primary_sale,secondary_sale,unit_price,discount,total_price,updated_status,order_id) VALUES (?,?,?,?,?,?,?)',
    [primary_sale,secondary_sale,unit_price,discount,total_price,updated_status,order_id],    (err,result) =>{
        if(err) {
            console.log("lafda hogya")
            res.send("gadbad hogyi hai"+err);
        }
        else{
            console.log(result);
            res.send("Items inserted");
        }
    }
    );
});




app.listen(3005,()=>{
    console.log("running server on port 3005");
})