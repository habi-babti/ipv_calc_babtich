import './ResultsTable.css';

function ResultsTable({ results, type }) {
  if (type === 'table1') {
    return (
      <div className="results-table">
        <h3>Résultats finaux</h3>
        <table>
          <tbody>
            <tr>
              <td>Bits de sous-réseau</td>
              <td>{results.subnetBits}</td>
            </tr>
            <tr>
              <td>Nombre de sous-réseaux</td>
              <td>{results.numberOfSubnets}</td>
            </tr>
            <tr>
              <td>Bits d'hôte</td>
              <td>{results.hostBits}</td>
            </tr>
            <tr>
              <td>Hôtes utilisables</td>
              <td>{results.usableHosts}</td>
            </tr>
            <tr>
              <td>Adresse réseau</td>
              <td>{results.networkAddress}</td>
            </tr>
            <tr>
              <td>Premier hôte</td>
              <td>{results.firstHost}</td>
            </tr>
            <tr>
              <td>Dernier hôte</td>
              <td>{results.lastHost}</td>
            </tr>
            <tr>
              <td>Adresse de broadcast</td>
              <td>{results.broadcastAddress}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="results-table">
      <h3>Résultats finaux</h3>
      <table>
        <tbody>
          <tr>
            <td>Bits d'hôte</td>
            <td>{results.hostBits}</td>
          </tr>
          <tr>
            <td>Nombre total d'hôtes</td>
            <td>{results.totalHosts}</td>
          </tr>
          <tr>
            <td>Hôtes utilisables</td>
            <td>{results.usableHosts}</td>
          </tr>
          <tr>
            <td>Adresse réseau</td>
            <td>{results.networkAddress}</td>
          </tr>
          <tr>
            <td>Adresse de broadcast</td>
            <td>{results.broadcastAddress}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ResultsTable;
