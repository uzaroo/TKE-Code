import { LightningElement, track, wire,api } from 'lwc';
import { gql, graphql } from 'lightning/uiGraphQLApi';

// Define the GraphQL query
// Define the GraphQL query


export default class SearchComponent extends LightningElement {
 
  @track isOnline = navigator.onLine;

  connectedCallback() {
      // Listen for online and offline events
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
  }

  disconnectedCallback() {
      // Clean up event listeners
      window.removeEventListener('online', this.handleOnline.bind(this));
      window.removeEventListener('offline', this.handleOffline.bind(this));
  }

  handleOnline() {
    debugger;
      this.isOnline = true;
      console.log('You are online');
      // Perform online-specific tasks
  }

  handleOffline() {
    debugger;
      this.isOnline = false;
      console.log('You are offline');
      // Perform offline-specific tasks
  }

  @api searchTerm ='';// 'Muntz Bronze Finish';
@track products = [];
@track isSearching = false;
recordcount;
selectedProduct;
loadFromLocalStorage() {
  const storedEntries = localStorage.getItem('pricebookEntriesoffline');
  if (storedEntries) {
      this.products = JSON.parse(storedEntries);
  }
}

handleSearchChange(event) {
    debugger;

    this.searchTerm = event.target.value.length>=3?event.target.value:'';
    this.isSearching = this.searchTerm.length >= 3;
    this.selectedProductData = this.products.find(product => product.Name.contains(event.target.value));
   // this.refresh();
}
async refresh() {
  return refreshGraphQL(this.products);
}

handleProductSelect(event)
{
  debugger;
  const productId = event.target.dataset.id;
  this.selectedProduct = this.products.find(product => product.Id === productId);
this.products=undefined;
}

}


// import { LightningElement, track, wire } from 'lwc';
// import { gql, graphql } from 'lightning/uiGraphQLApi';


// export default class SearchComponent extends LightningElement {
//  searchTerm = 'muntz';
//  products = [];
//  isSearching = false;
// @wire(graphql, {
//   query: '$pricebookentryquery',
// variables: '$searchVariables'
// })
// wiredProducts({ error, data }) {
// debugger;
// if (data) {
//     debugger;
//     if(data.uiapi.query.PricebookEntry.edges.length>0 )
//     {
//     this.products =  data.uiapi.query.PricebookEntry.edges.map((edge) => edge.node);

// }
//     this.isSearching = false;
// } else if (error) {
//     console.error('Error fetching products', error);
//     this.products = [];
//     this.isSearching = false;
// }
// }
// get pricebookentryquery() {
//   return gql`
//       query getPricebookEntry($searchTerm: String) {
//           uiapi {
//               query {
//                   PricebookEntry (
//                       where: {
                       
//                           Name: { like:$searchTerm },
//                       }
//                       first: 200, upperBound:5000
//                   ) {
//                       edges {
//                           node {
//                               Id
//                               Name {
//                                   value
//                               }
//                           }
//                       }
//                   }
//               }
//           }
//       }
//  `;
// }

// get searchVariables()
// {
//   return 
//   searchTerm:this.searchTerm;
// }


// handleSearchChange(event) {
//     debugger;

//     this.searchTerm = event.target.value.length>=3?event.target.value:'';
//     this.isSearching = this.searchTerm.length >= 3;
// }


// }