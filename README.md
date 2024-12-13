# Tamper Proof Data

At Bequest, we require that important user data is tamper proof. Otherwise, our system can incorrectly distribute assets if our internal server or database is breached. 

A full demo of this implementation has been sent with the email.

**1. How does the client ensure that their data has not been tampered with?**

In order to ensure data has not been tampered with, I added to layers to check db data is accurate. 
- First is adding replicas, each record coming to us will be stored 3 times. Data redundancy helps with backups and makes it much harder to compromise the db. This solution is very convenient if we have a cloud db, they can manage replicas for us in different instances, and have the DB in different regions if needed.
- Second is hashing the data at server level. When server receives the data it will hash it using (Hash-based Message Authentication Code), this uses a secret key that we do not expose, on a production level it has to be stored in a vault.I stored the secret in my env file, that I didn't commit, and used th dotenv library to retrieve that value.
When the data is corrupted, we can check it in 2 ways, one of the replicas is not the same as others, or we can check whether the hash we have in the db matches the incoming hash from the client, if it doesn't match the stored hash we have (because data has been tampered with), we will know it as well.

You can find this implemented using the verify button + endpoint in the client and server application classes
<br />
**2. If the data has been tampered with, how can the client recover the lost data?**

Since we have replicas, if one of them is corrupted we get the data from the others. We can also reverse find the data using the hash and our secret key.
You can find this implemented in the Restore button + endpoint in the  client and server application classes

Edit this repo to answer these two questions using any technologies you'd like, there any many possible solutions. Feel free to add comments.

### To run the apps:
```npm run start``` in both the frontend and backend

## To make a submission:
1. Clone the repo
2. Make a PR with your changes in your repo
3. Email your github repository to robert@bequest.finance
