class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    // To make a copy of the query object.
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields", "search"];
    // to delete the excluded fields from the query object.
    excludedFields.forEach((item) => delete queryObj[item]);

    // 1) Advance Filtering
    let queryStr = JSON.stringify(queryObj);
    // the \b to match exactly the arrguments we specified
    // (match) is the value if we found it and the returned value is the replaced value.
    queryStr = queryStr?.replace(
      /\b(lt|lte|gt|gte)\b/g,
      (match) => `$${match}`
    );

    // console.log(JSON.parse(queryStr));

    // Replace the user with req.user.
    // const filterQueryString = Object.assign(JSON.parse(queryStr), {
    //   user: "1313",
    // });
    // console.log(filterQueryString);

    // the Series return a query object we can use to do filtering and pagination and more.
    this.query = this.query.find(JSON.parse(queryStr));
    // returning (this) will make us able to chain the methods.
    return this;
  }

  search() {
    // console.log(this.query.play);
    if (this.queryString.search) {
      const searchTerm = this.queryString.search;
      const filter = { name: { $regex: new RegExp("^" + searchTerm, "i") } };
      this.query = this.query.find(filter);
    }
    return this;
  }

  sort() {
    // 2) Sorting

    if (this.queryString.sort) {
      // this will split the query string by a comma converting it to array then join it with space.
      const sortQuery = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortQuery);
    } else {
      // To always sort by the created date in ascending(-) order newest first.
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }
  field() {
    // 3) Fields --> to return a specific fields only.

    if (this.queryString.fields) {
      const fieldsQuery = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fieldsQuery);
    } else {
      // Also we can use it to hide fields we don't want the client to see using(-).
      this.query = this.query.select("-__v");
    }

    return this;
  }
  pagination() {
    // 4) Pagination --> to limit the results on a page

    const page = this.queryString.page * 1 || 1;
    const limit = 12; // 9 cards per page
    const skip = (page - 1) * limit;
    // the skip method for the amount of results we want to skip the show the rest of the results.
    // and the limit to limit the number of result at each page/time.
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
