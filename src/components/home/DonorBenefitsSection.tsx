
const DonorBenefitsSection = () => {

  return (
    <section className="relative py-16 px-4">
      {/* Top angled divider */}
      <div className="absolute -top-1 left-0 w-full h-32 bg-gradient-to-br from-muted/30 to-background" style={{clipPath: 'polygon(0 100%, 100% 0, 100% 100%, 0 100%)'}}></div>
      
      {/* Bottom angled divider */}
      <div className="absolute -bottom-1 left-0 w-full h-32 bg-gradient-to-tr from-background to-muted/30" style={{clipPath: 'polygon(0 0, 100% 100%, 100% 0, 0 0)'}}></div>
      
      <div className="container mx-auto text-center relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Your Donor Benefits</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
          As a valued member of the Axanar community, enjoy exclusive access and benefits
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="group p-8 rounded-xl bg-gradient-to-br from-card via-card to-card/50 border-2 border-transparent hover:border-axanar-teal/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-axanar-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-axanar-teal/30 to-axanar-teal/20 text-axanar-teal flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-axanar-teal/30">
              <img src="/images/phaser.svg" alt="Exclusive Access icon" className="h-10 w-10 group-hover:animate-pulse filter drop-shadow(0 3px 5px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 2px rgba(0, 0, 0, 1))" style={{filter: 'drop-shadow(0 3px 5px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 2px #000)'}} />
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-axanar-teal transition-colors duration-300">Exclusive Access</h3>
            <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
              Access your complete contribution history and donor status with premium insights.
            </p>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-axanar-teal/0 via-axanar-teal to-axanar-teal/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>
          
          <div className="group p-8 rounded-xl bg-gradient-to-br from-card via-card to-card/50 border-2 border-transparent hover:border-yellow-400/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400/30 to-yellow-400/20 text-yellow-400 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-yellow-400/30">
              <img src="/images/research.svg" alt="Recognition icon" className="h-10 w-10 group-hover:animate-pulse filter drop-shadow(0 3px 5px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 2px rgba(0, 0, 0, 1))" style={{filter: 'drop-shadow(0 3px 5px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 2px #000)'}} />
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-yellow-400 transition-colors duration-300">Recognition</h3>
            <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
              View your donor level and receive special recognition within the community.
            </p>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400/0 via-yellow-400 to-yellow-400/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>
          
          <div className="group p-8 rounded-xl bg-gradient-to-br from-card via-card to-card/50 border-2 border-transparent hover:border-rose-400/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-400/30 to-rose-400/20 text-rose-400 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-rose-400/30">
              <img src="/images/perk.svg" alt="Perks icon" className="h-10 w-10 group-hover:animate-pulse filter drop-shadow(0 3px 5px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 2px rgba(0, 0, 0, 1))" style={{filter: 'drop-shadow(0 3px 5px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 2px #000)'}} />
            </div>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-rose-400 transition-colors duration-300">Perks</h3>
            <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
              Track your earned perks and rewards from your contributions with exclusive benefits.
            </p>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400/0 via-rose-400 to-rose-400/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DonorBenefitsSection;
