import Case from '../models/cases'

export const createCase = async (req, res) => {
    
    const { acosador, telAcosador, desc} = req.body

    const newCase = new Case({
        acosador,
        telAcosador,
        desc
    })
    //GUARDAMOS EL DATO EN LA BASE DE DATOS
    const caseSaved = await newCase.save()

    res.status(201).json(caseSaved)
}

export const getCase = async (req, res) => {
    const cases = await Case.find()
    res.json(cases)
}

export const getCaseById = async (req, res) => {
    const casos = await Case.findById(req.params.caseId)
    res.status(200).json(casos)
}

export const updateCase = async (req, res) => {
    const updatedCase = await Case.findByIdAndUpdate(req.params.caseId, req.body, {
        new: true
    })
    res.status(200).json(updatedCase)
}

export const deleteCase = async (req, res) => {
    const {caseId} = req.params;
    await Case.findByIdAndDelete(caseId)
    res.status(200).json()
}