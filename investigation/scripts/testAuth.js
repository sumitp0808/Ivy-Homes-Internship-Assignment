import { ApiClient } from "../api/client.js";
import { login } from "../api/auth.js";

const client = new ApiClient();

try {
    const response = await login(client); 
    // console.log(response);

    const listings = await client.get("/v1/listings", {page: 1, limit: 5});
    console.log(listings);
    

} catch (error) {
    console.error("Login failed:");
    console.error(error.message);
}