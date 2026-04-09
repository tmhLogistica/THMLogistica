"use client"
//hooks
import { useState, useEffect } from 'react'
import useModal from '../../../../../hooks/useModal'
//Helpers
import { helpHttp } from "../../../../../helpers/helpHttp";
//components
import { ModalAviso } from '../ModalAviso/ModalAviso'
import { Loader } from '@/components/shared/Load';
import Image from 'next/image';
import classNames from 'classnames/bind';
//styles
import styles from '../../HeroForm.module.sass'
//types
import { initialFormProps, initialErrorProps } from './Form.model'


interface Window {
    dataLayer: Record<string, any>[];
  }

export const Form = () => {

    const { isOpenModal, openModal, closeModal } = useModal();

    const initialForm: initialFormProps = {
        tipodeServicio: 'Servicio de Almacenaje',
        fechaServicio: "",
        firstName: "",
        email: "",
        phone: "",
        tyc: false
    }

    const [form, setForm] = useState(initialForm)
    const [selectedOption, setSelectedOption] = useState("");
    const [aviso, setAviso] = useState(false)
    const [loading, setLoading] = useState(false)
    const [visible, setVisible] = useState(false)
    let errores: initialErrorProps = {}
    const [errorsState, setErrorsState] = useState(errores)
    //console.log("Errores", errorsState)
    //console.log('form', form)

    const cx = classNames.bind(styles);

    const buttonStyles = cx('Novisible', {
        'containerInputButton': visible,
    });
    //Handle para actualizar los valores del form 
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        })
    }

    const handleFecha = (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            fechaServicio: event.target.value
        });
    };

    //Handle para ir mapeando los errores 
    const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e);
        setErrorsState(validationsForm(form))
    };

    //Handle para Seleccionar el tipo de Servicio 
    const handleServicio = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(e.target.value);
        setForm({
            ...form,
            tipodeServicio: e.target.value
        });
    };

    //Handle para Seleccionar si se leyo el Aviso de Privacidad o no
    const handleChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAviso(!aviso)
        setForm({
            ...form,
            tyc: !form.tyc
        });
    }

    const handleAviso = () => {
        setAviso(!aviso)
        setForm({
            ...form,
            tyc: !form.tyc
        });
    }

    /*VALIDACIONES*/
    const validationsForm = (form: initialFormProps) => {
        let errors: initialErrorProps = {}

        const campoNovacio = /.+/;
        const campoCantidadDigitos = /^\d{4,10}$/;
        const campoSoloNumeros = /^\d+$/;
        const regexEmail = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/

        /*Nombre*/
        if (!form.firstName.trim()) {
            errors.firstName = 'Este campo es obligatorio'
        } else if (/\d/.test(form.firstName)) {
            errors.firstName = 'El nombre no puede contener números';
        }

        /*Correo Electronico*/
        if (form.email.length === 0) {
            errors.email = 'Este campo es obligatorio'
        } else if (!regexEmail.test(form.email.trim())) {
            errors.email = 'Ingrese un email validado'
        }


        /*Telefono*/
        if (!form.phone) {
            errors.phone = 'Este campo es obligatorio'
        } else if (!/^\d+$/.test(form.phone.trim())) {
            errors.phone = 'Solo caracteres numéricos sin espacios';
        }


        return errors
    }


    useEffect(() => {
        if (Object.keys(errorsState).length === 0 && form.tyc) {
            setVisible(true)
        }
    }, [errores])


    async function sendDataEmail(form: initialFormProps) {
const url = `/api/send`
let options = {
 body: form,
 headers: { "content-type": "application/json" },
 };
 await helpHttp()
 .post(url, options)
 .then((res) => {
  console.log(res)
  setLoading(false)
                
  // --- INICIO TRACKING GTM ---
  // Verificamos que 'window' exista (Next.js SSR safety)
  if (typeof window !== 'undefined') {
  // Usamos (window as any) para evitar errores de TypeScript si no tienes dataLayer declarado globalmente
  ;(window as Window).dataLayer = (window as Window).dataLayer || [];
  ;(window as Window).dataLayer.push({
  event: 'form_lead_sent',
                        // Opcional: Mandar datos extra que no rompan privacidad para analítica
  tipo_servicio: form.tipodeServicio 
  });
  }
  // --- FIN TRACKING GTM ---

  handleReset()
 });
 }


    //HANDLE RESET
    const handleReset = () => {
        setForm(initialForm)
        setAviso(false)
        setVisible(false)
    }

    //Handle de envio de Formulario
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrorsState(validationsForm(form))
        //console.log("Formulario", form)
        if (Object.keys(errorsState).length === 0 && form.tyc) {
            handleReset()
            setLoading(true)
            sendDataEmail(form)
            //console.log("Formulario", form)
        }
    }

    if (loading) {
        return (
            <div className={styles.ContainerForm}>
                <Loader />
            </div>
        )
    }
    else {
        return (
            <form className={styles.ContainerForm} onSubmit={handleSubmit}>
                <ModalAviso isOpenModal={isOpenModal} closeModal={closeModal} />
                <div className={styles.title}>
                    <span>Cotiza tu servicio de transporte y almacenaje</span>
                </div>
                <div className={styles.Form}>
                    <div className={styles.bloque}>
                        <div className={styles.title}>
                            <span>Datos del servicio</span>
                        </div>
                        <div className={styles.containerInputs}>
                            <div className={styles.rowInputs}>
                                <div className={styles.containerInput}>
                                    <label htmlFor='tipodeServicio'>Tipo de servicio</label>
                                    <select
                                        id='tipodeServicio'
                                        className={styles.input}
                                        onChange={handleServicio}
                                        value={selectedOption}
                                    >
                                        <option value="" disabled>Seleccionar</option>
                                        <option value="Servicio de Almacenaje">*Servicio de Almacenaje</option>
                                        <option value="Servicio de Transporte">*Servicio de Transporte</option>
                                    </select>
                                </div>
                                <div className={styles.containerInput}>
                                    <label>Fecha de servicio</label>
                                    <input
                                        type='date'
                                        className={styles.input}
                                        placeholder='Seleccionar'
                                        onChange={handleFecha}
                                        value={form.fechaServicio}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.bloque}>
                        <div className={styles.title}>
                            <span>Tus Datos</span>
                        </div>
                        <div className={styles.containerInputs}>
                            <div className={styles.rowInputs}>
                                <div className={styles.containerInput}>
                                    <label htmlFor="name">Nombre Completo</label>
                                    <input
                                        type='text'
                                        className={styles.input}
                                        placeholder='Nombre Completo'
                                        id="firtsName"
                                        name="firstName"
                                        value={form.firstName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required
                                    />
                                    {errorsState.firstName && (
                                        <p className={styles.novalidado}>
                                            {errorsState.firstName}
                                        </p>
                                    )}

                                </div>
                            </div>
                            <div className={styles.rowInputs}>
                                <div className={styles.containerInput}>
                                    <label htmlFor="email">Correo electrónico</label>
                                    <input
                                        type='email'
                                        className={styles.input}
                                        placeholder='ejemplo@mail.com'
                                        id="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required
                                    />
                                    {errorsState.email && (
                                        <p className={styles.novalidado}>
                                            {errorsState.email}
                                        </p>
                                    )}
                                </div>
                                <div className={styles.containerInput}>
                                    <label htmlFor="phone">Teléfono</label>
                                    <input
                                        type='tel'
                                        name="phone"
                                        id="phone"
                                        className={styles.input}
                                        placeholder='55 123 12345678'
                                        value={form.phone}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required
                                        pattern="[0-9]*"
                                        inputMode="numeric"
                                    />
                                    {errorsState.phone && (
                                        <p className={styles.novalidado}>
                                            {errorsState.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.bloque}>
                        <div className={styles.containerInputs}>
                            <div className={styles.rowInputs}>
                                <div className={styles.containerInputCheck}>
                                    {aviso ? <div className={styles.falseCheckboxOn} onClick={handleAviso}>
                                        <div className={styles.containerImg}>
                                            <Image src="/icons/Check.png" alt="check" fill />
                                        </div>
                                    </div> : <div className={styles.falseCheckboxOff} onClick={handleAviso}>
                                    </div>}
                                    <input
                                        type='checkbox'
                                        className={styles.inputCheck}
                                        onChange={handleChecked}
                                        name="checkForm"
                                        id="checkForm"
                                    />
                                    <label htmlFor="checkForm">Acepto que he leído el </label><b onClick={openModal}>Aviso de privacidad</b>
                                </div>
                                <div className={buttonStyles}>
                                    <input
                                        className={styles.button}
                                        type='submit'
                                        value="Cotizar"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        )
    }
}
