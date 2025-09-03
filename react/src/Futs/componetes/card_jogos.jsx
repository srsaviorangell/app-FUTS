import '../App.css';

const LiveGameCard = ({ homeLogo, awayLogo, homeScore, awayScore }) => {
  // Cores fixas
  const homeBgColor = 'bg-red-500/80 grade-exio1';       // vermelho fixo para o time da casa
  const awayBgColor = 'bg-black/80';      // azul fixo para o visitante

  return (
    //conteiainer do card
    <div className="  bg-gradient-to-br from-gray-800 to-gray-900 shadow-md rounded-md flex justify-center items-center w-1/3 h-1/4 saviogan1" >
     
      <div  className=" relative w-[16.2rem] h-[9.8rem] overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 rounded-md saviogan1">
        {/* Tag LIVE */}
        <div className=" absolute z-10 top-1 right-1 font-orbitron font-bold text-white text-[0.9rem] bg-red-600 rounded-full px-1">
          LIVE
        </div>

        {/* Placar */}
        <div className=" border absolute z-10 top-8 left-11 font-orbitron font-bold text-white text-[0.5rem] bg-black bg-opacity-50 rounded-lg flex flex-col items-center justify-center w-7 h-10">
          <span>{homeScore}</span>
          <span>x</span>
          <span>{awayScore}</span>
        </div>

        {/* Logo do time da casa */}
        <div className={`border absolute inset-0 grade-eixo1 ${homeBgColor} clip-home flex items-start justify-start`}>
          <img src={homeLogo} alt="Home Team Logo" className="w-9 h-10 m-2" />
        </div>

        {/* Logo do visitante */}
        <div className={`absolute inset-0 ${awayBgColor} clip-visitor flex items-end justify-end`}>
          <img src={awayLogo} alt="Visitor Team Logo" className="w-9 h-10 m-2" />
        </div>
      </div>
    </div>
  );
};

export default LiveGameCard;
