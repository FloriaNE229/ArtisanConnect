import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, Loader, Store } from 'lucide-react';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import { atelierAPI, serviceAPI } from '../../../../services/api';

export default function ServiceRequest() {

  const { artisanId } = useParams(); // /services/request/:artisanId
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [atelierInfo, setAtelierInfo] = useState(null);
  const [offres, setOffres] = useState([]);

  const [formData, setFormData] = useState({
    offre_id: '',
    description: '',
  });

  // =========================
  // Charger atelier
  // =========================

  useEffect(() => {

    if (!artisanId) {
      setErrors({ submit: "Atelier introuvable" });
      return;
    }

    const fetchAtelier = async () => {
      try {

        const data = await atelierAPI.show(artisanId);

        const atelier = data.atelier ?? data;

        setAtelierInfo(atelier);

        setOffres(atelier.offres ?? []);

      } catch (err) {

        setErrors({ submit: "Impossible de charger l'atelier" });

      }
    };

    fetchAtelier();

  }, [artisanId]);



  // =========================
  // Validation
  // =========================

  const validate = () => {

    const e = {};

    if (!artisanId) {
      e.submit = "Atelier invalide";
    }

    if (
      formData.description.trim().length > 0 &&
      formData.description.trim().length < 5
    ) {
      e.description = "Description trop courte (min 5 caractères)";
    }

    return e;
  };



  // =========================
  // Submit
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {

      const payload = {

        atelier_id: Number(artisanId),

        offre_id: formData.offre_id
          ? Number(formData.offre_id)
          : undefined,

        description: formData.description.trim() || undefined,
      };

      console.log("PAYLOAD", payload);

      await serviceAPI.store(payload);

      setSuccess(true);

      setTimeout(() => {
        navigate("/my-services");
      }, 1500);

    } catch (err) {

      if (err.errors) {

        const mapped = {};

        Object.entries(err.errors).forEach(([k, msgs]) => {
          mapped[k] = Array.isArray(msgs) ? msgs[0] : msgs;
        });

        setErrors(mapped);

      } else {

        setErrors({
          submit: err.message || "Erreur lors de l'envoi",
        });

      }

    } finally {

      setLoading(false);

    }

  };



  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };



  // =========================
  // SUCCESS
  // =========================

  if (success) {

    return (
      <div className="flex items-center justify-center min-h-screen pt-24 pb-20"
        style={{ backgroundColor: 'var(--light)' }}>

        <Card className="w-full max-w-md p-12 text-center">

          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full"
            style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}>

            <CheckCircle className="w-12 h-12"
              style={{ color: '#22c55e' }} />

          </div>

          <h2 className="mb-4 text-3xl font-black">
            Demande envoyée !
          </h2>

          <p className="mb-6 text-sm opacity-70">
            Votre demande a été envoyée à l'artisan
          </p>

          <Button
            onClick={() => navigate("/my-services")}
            className="w-full"
          >
            Voir mes demandes
          </Button>

        </Card>

      </div>
    );
  }



  // =========================
  // UI
  // =========================

  return (

    <div
      className="min-h-screen pt-24 pb-20"
      style={{ backgroundColor: 'var(--light)' }}
    >

      <div className="max-w-2xl px-4 mx-auto">

        {/* retour */}

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>


        {/* header */}

        <div className="mb-8">

          <h1 className="text-3xl font-black">
            Demande de service
          </h1>

          {atelierInfo && (

            <div className="flex items-center gap-2 mt-2 text-sm">

              <Store className="w-4 h-4" />

              {atelierInfo.nom}

            </div>

          )}

        </div>



        <Card className="p-6">

          {errors.submit && (

            <div className="p-3 mb-4 text-sm text-red-600 bg-red-100 rounded">
              {errors.submit}
            </div>

          )}



          <form onSubmit={handleSubmit} className="space-y-6">


            {/* OFFRE */}

            {offres.length > 0 && (

              <select
                name="offre_id"
                value={formData.offre_id}
                onChange={handleChange}
                className="w-full border rounded p-2"
              >

                <option value="">
                  Choisir une offre
                </option>

                {offres.map(o => (

                  <option key={o.id} value={o.id}>
                    {o.titre}
                  </option>

                ))}

              </select>

            )}



            {/* description */}

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="w-full border rounded p-2"
              placeholder="Description..."
            />



            <div className="flex gap-4">

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Annuler
              </Button>


              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >

                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  "Envoyer"
                )}

              </Button>

            </div>

          </form>

        </Card>

      </div>

    </div>

  );

}