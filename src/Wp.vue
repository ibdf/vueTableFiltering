<template>
  <div id="wp">
      <table v-if="results && results.total_rows > 0" border="1">
          <tr>
              <th v-for="key in Object.keys(results.fields)" :key="key">{{ key }}</th>
          </tr>
          <tr v-for="row in results.rows" v-bind:key="row.cartodb_id">
              
            <td v-for="key in Object.keys(results.fields)" :key="'td-' + key">
                {{ row[key] }}
            </td>
          </tr>
      </table>
  </div>
</template>

<script>
import axios from 'axios';

var carto_query = 'SELECT * FROM qualified_voter_listing_2015_primary_election LIMIT 100';

export default {
  name: 'wp',
  data () {
    return {
      results: []
    }
  },
  created(){
      axios.get('https://data.phila.gov/carto/api/v2/sql?q=' + carto_query)
      .then(response => {
          this.results = response.data
          console.log(this.results);
      }).catch(e => {
          this.errors.push(e);
      });
  }
}
</script>